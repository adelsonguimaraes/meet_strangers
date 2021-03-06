import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from './store.js';

let connectedUserDetails;
let peerConnection;
let dataChannel;
const defaultConstraints = {
    audio: true,
    video: true
};

const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:13902'
        }
    ]
};

// pegando o fluxo de media do navegador
// e passalndo para atualizar o video local
export const getLocalPreview = () => {
    navigator.mediaDevices
    .getUserMedia(defaultConstraints)
    .then((stream) => {
        ui.updateLocalVideo(stream);
        ui.showVideoCallButtons();
        store.setCallState(constants.callState.CALL_AVAILABLE);
        store.setLocalStream(stream);
    })
    .catch((err) => {
        console.log('error ocurred when trying to get an access to camera');
        console.log(err);
    });
};

const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection(configuration);

    // criando uma canal de dados
    dataChannel = peerConnection.createDataChannel('chat');

    // escutando eventos do canal de dados
    peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;

        // evento quando o canal de dados é aberto
        dataChannel.onopen = () => {
            console.log('peer connection is ready to receive data channel messages');
        };

        // evento quando o canal de dados recebe uma mensagem
        // acontece do lado de quem recebe
        dataChannel.onmessage = (event) => {
            console.log('message came from data channel');
            const message = JSON.parse(event.data);
            // adiciona mensagem no chat quando receber
            ui.appendMessage(message);
        };
    };

    peerConnection.onicecandidate = (event) => {
        console.log('geeting ice candidates from stun server');
        if (event.candidate) {
            // send our ice candidates to other peer
            wss.sendDataUsingWebRTCSignaling({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRTCSignaling.ICE_CANDIDATE,
                candidate: event.candidate
            });
        }
    }

    peerConnection.onconnectionstatechange = (event) => {
        if (peerConnection.connectionState === 'connected') {
            console.log('succesfully connected with other peer');
        }
    }

    // receiving tracks
    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);

    peerConnection.ontrack = (event) => {
        remoteStream.addTrack(event.track);
    }

    // add our stream to peer connection

    if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE || connectedUserDetails.callType === constants.callType.VIDEO_STRANGER) {
        const localStream = store.getState().localStream;

        for (const track of localStream.getTracks()) {
            peerConnection.addTrack(track, localStream);
        }
    }
};

export const sendMessageUsingDataChannel = (message) => {
    const stringifiedMessage = JSON.stringify(message);
    dataChannel.send(stringifiedMessage);
};

// enviando pre oferta para o servidor
export const sendPreOffer = (callType, calledPersonalCode) => {
    connectedUserDetails = {
        callType,
        socketId: calledPersonalCode
    };

    if (callType === constants.callType.CHAT_PERSONAL_CCODE || callType === constants.callType.VIDEO_PERSONAL_CODE) {
        const data = {
            callType,
            calledPersonalCode
        };

        ui.showCallingDialog(callingDialogRejectCallHandler);
        store.setCallState(constants.callState.CALL_UNAVAILABLE);
        wss.sendPreOffer(data);
    }

    if (callType === constants.callType.CHAT_STRANGER || callType === constants.callType.VIDEO_STRANGER) {
        const data = {
            callType,
            calledPersonalCode
        };
        store.setCallState(constants.callState.CALL_UNAVAILABLE);
        wss.sendPreOffer(data );
    }
};

export const handlePreOffer = (data) => {
    const { callType, callerSocketId } = data;

    if (!checkCallPossibility()) {
        return sendPreOfferAnswer(constants.preOfferAnswer.CALL_UNAVAILABLE, callerSocketId);
    }

    connectedUserDetails = {
        socketId: callerSocketId,
        callType
    };

    store.setCallState(constants.callState.CALL_UNAVAILABLE);

    if (
        callType === constants.callType.CHAT_PERSONAL_CCODE ||
        callType === constants.callType.VIDEO_PERSONAL_CODE
    ){
        console.log('Showing call dialog');
        ui.showIncomingDialog(callType, acceptCallHandler, rejectCallHandler);
    }

    if (callType === constants.callType.CHAT_STRANGER || callType === constants.callType.VIDEO_STRANGER) {
        createPeerConnection();
        sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
        ui.showCallElements(connectedUserDetails.callType);
    }
};

// ação de aceitar chamada
const acceptCallHandler = () => {
    console.log("call accepted");
    createPeerConnection();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.callType);
};

// ação de rejeitar chamada
const rejectCallHandler = () => {
    console.log("call rejected");

    // enviando resposta
    sendPreOfferAnswer();
    setIncomingCallAvailable();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

const callingDialogRejectCallHandler = () => {
    const data = {
        connectedUserSocketId: connectedUserDetails.socketId
    };
    closePeerConnectionAndResetState();

    wss.sendUserHangedUp(data);
};

const sendPreOfferAnswer = (preOfferAnswer, callerSocketId = null) => {
    const socketId = callerSocketId ? callerSocketId : connectedUserDetails.socketId;
    const data = {
        callerSocketId: socketId,
        preOfferAnswer
    };
    // removendo todo o modal/dialogo de chamada
    ui.removeAllDialogs();
    wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = (data) => {
    const { preOfferAnswer } = data;

    // removendo todo o modal/dialogo de chamada
    ui.removeAllDialogs();

    if (preOfferAnswer === constants.preOfferAnswer.CALLE_NOT_FOUND) {
        // show dialog that callee has not been found
        
        // chamando a função que mostra o dialogo de resposta
        // para quem fez a chamada
        ui.showInfoDialog(preOfferAnswer);
        setIncomingCallAvailable();
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        // show dialog that callee is not able to connect

        // chamando a função que mostra o dialogo de resposta
        // para quem fez a chamada
        ui.showInfoDialog(preOfferAnswer);
        setIncomingCallAvailable();
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        // show dialog that call is rejected by the callee

        // chamando a função que mostra o dialogo de resposta
        // para quem fez a chamada
        ui.showInfoDialog(preOfferAnswer);
        setIncomingCallAvailable();
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
        ui.showCallElements(connectedUserDetails.callType);
        createPeerConnection();
        sendWebRTCOffer();
    }
};

// enviandos dados via sinal webrtc
const sendWebRTCOffer = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.OFFER,
        offer: offer
    });
};


// evento quando aceita a chamada, do lado de quem recebe
export const handleWebRTCOffer = async (data) => {
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ANSWER,
        answer: answer
    });
};

// evento de quando aceita chamada do lado de quem chama
export const handleWebRTCAnswer = async (data) => {
    console.log('handling webRTC Answer');
    await peerConnection.setRemoteDescription(data.answer);
};

export const handleWebRTCCandidate = async (data) => {
    console.log('handling incoming webRTC candidates');
    try {
        await peerConnection.addIceCandidate(data.candidate);
    }catch (err) {
        console.error(
            'error occured when trying to add received ice candidate',
            err
        );
    }
};

let screenSharingStream;

// escolhendo a tela a ser compartilhada
export const switchBetweenCameraAndScreenSharing = async (screenSharingActive) => {
    if (screenSharingActive) {
        const localStream = store.getState().localStream;
        const senders = peerConnection.getSenders();

        const sender = senders.find((sender) => {
            return (
                sender.track.kind === localStream.getVideoTracks()[0].kind
            );
        });

        if (sender) {
            sender.replaceTrack(localStream.getVideoTracks()[0]);
        }

        // stop screen sharing stream
        // parando a stream da tela compartilhada
        store.getState().screenSharingStream.getTracks()
        .forEach((track) => track.stop());

        store.setScreenSharingActive(!screenSharingActive);

        ui.updateLocalVideo(localStream);
    }else{
        console.log('switching for screen sharing');
        try {
            screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });
            store.setScreenSharingStream(screenSharingStream);

            // replace track which sender is sending
            const senders = peerConnection.getSenders();

            const sender = senders.find((sender) => {
                return (
                    sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
                );
            });

            if (sender) {
                sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
            }

            store.setScreenSharingActive(!screenSharingActive);

            ui.updateLocalVideo(screenSharingStream);
        } catch (err) {
            console.error(
                'error ocurred when trying to get screen sharing stream',
                err
            );
        }
    }
};

// hang up

export const handleHangUp = () => {
    const data = {
        connectedUserSocketId: connectedUserDetails.socketId
    };

    wss.sendUserHangedUp(data);
    closePeerConnectionAndResetState();
};

// evento quando o parceiro desligar a chamada
export const handleConnectedUserHangedUp = () => {
    closePeerConnectionAndResetState();
}

const closePeerConnectionAndResetState = () => {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    // active mic and camera
    if (
        connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
        connectedUserDetails.callType === constants.callType.VIDEO_STRANGER
    ) {
        store.getState().localStream.getVideoTracks()[0].enabled = true;
        store.getState().localStream.getAudioTracks()[0].enabled = true;
    }

    ui.updateUIAfterHangUp(connectedUserDetails.callType);
    setIncomingCallAvailable();
    connectedUserDetails = null;
};

// verifica se a chamada é possível
const checkCallPossibility = (callType) => {
    const callState = store.getState().callState;

    // se o status da chamada for possível retorna true
    if (callState === constants.callState.CALL_AVAILABLE) {
        return true;
    }

    // se a call for do tipo video_personal_code ou video_stranger ou chat_available_only_chat
    if (
        callType === constants.callType.VIDEO_PERSONAL_CODE ||
        callType === constants.callType.VIDEO_STRANGER ||
        callType === constants.callState.CALL_AVAILABLE_ONLY_CHAT
    ){
        return false;
    }

    return false;
}

// atualiza o status da chamada
const setIncomingCallAvailable = () => {
    const localStream = store.getState().localStream;
    if (localStream) {
        store.setCallState(constants.callState.CALL_AVAILABLE);
    }else{
        store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT);
    }
};