import * as constants from "./constants.js";
import * as elements from "./elements.js";

// atualiza o personal code na tela quando recebe do servidor
export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById("personal_code_paragraph");
    personalCodeParagraph.innerHTML = personalCode;
}

// pegando o elemento de video local
// e fazendo a atualização com a stream recebida
export const updateLocalVideo = (stream) => {
    const localVideo = document.getElementById('local_video');
    localVideo.srcObject = stream;

    localVideo.addEventListener('loadedmetadata', () => {
        localVideo.play();
    });
};

export const showVideoCallButtons = () => {
    const personalCodeVideoButton = document.getElementById('personal_code_video_button');
    const strangerVideoButton = document.getElementById('stranger_video_button');

    showElement(personalCodeVideoButton);
    showElement(strangerVideoButton);
};

// pegando o elemento de video remoto e atualziando
export const updateRemoteVideo = (stream) => {
    const remoteVideo = document.getElementById('remote_video');
    remoteVideo.srcObject = stream;
};

// mostra a caixa de dialogo na tela da pessoa que recebe a chamada
export const showIncomingDialog = (
    callType,
    acceptCallHandler,
    rejectCallHandler
) => {
    // pegando a informação de qual o tipo da chamada está sendo recebebida
    const callTypeInfo = callType === constants.callType.CHAT_PERSONAL_CCODE ? 'CHAT' : 'VIDEO';

    // recebendo o dialogo apartir da função que monta os elementos,
    // passando a informação do tipo da call e os botões
    const InommingCallDialog = elements.getIncommingCallDialog(
        callTypeInfo,
        acceptCallHandler,
        rejectCallHandler
    );

    // limpando todo o conteúdo do dialogo de chamada
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
    
    // adicionando o conteúodo de dialogo recebido
    dialog.appendChild(InommingCallDialog);
};


// mostra a caixa de dialogo para quem faz a chamada
export const showCallingDialog = (rejectCallHandler) => {
    // recebendo o dialogo apartir da função que monta os elementos
    // pasando0 apenas o botão de rejeitar/cancelar chamada
    const callingDialog = elements.getCallingDialog(rejectCallHandler);
    
    // limpado todo o conteúdo do dialogo de chamada
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
    
    // adicionando o conteúodo do dialogo de chamada
    dialog.appendChild(callingDialog);
};

// mosta o dialogo de acordo com a resposta
export const showInfoDialog = (preOfferAnswer) => {
    let infoDialog = null;

    // quando a ligação for rejeitada
    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        // recebendo o dialog da função que monta o dialogo para reposta
        // passando as informações que devem aparecer no dialogo
        infoDialog = elements.getInfoDialog(
            'Call rejected',
            'Calle rejected your call'
        );
    }

    // quando o id não for encontrado
    if (preOfferAnswer === constants.preOfferAnswer.CALLE_NOT_FOUND) {
        // recebendo o dialog da função que monta o dialogo para reposta
        // passando as informações que devem aparecer no dialogo
        infoDialog = elements.getInfoDialog(
            'Callee not found',
            'Please check personal code'
        );
    }

    // quando não for possível chamar
    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        // recebendo o dialog da função que monta o dialogo para reposta
        // passando as informações que devem aparecer no dialogo
        infoDialog = elements.getInfoDialog(
            'Call is not possible',
            'Probaly callee is busy. Please try again later'
        );
    }

    // se houve um dialogo de resposta
    // mostramos o dialogo na para quem fez a chamada
    if (infoDialog) {
        const dialog = document.getElementById('dialog');
        dialog.appendChild(infoDialog);

        // removendo dialogo depois de 4 segundos
        setTimeout(() => {
            removeAllDialogs();
        }, [4000]);
    }
};

// remove todo o conteúdo do dialogo de chamada
export const removeAllDialogs = () => {
    // removendo todos os dialogos de chamada
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
};

export const showCallElements = (callType) => {
    if (callType === constants.callType.CHAT_PERSONAL_CCODE) {
        showChatCallElements();
    }

    if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
        showVideoCallElements();
    }
};

const showChatCallElements = () => {
    const finishConnectionChatButtonContainer = document.getElementById(
        'finish_chat_button_container'
    );
    showElement(finishConnectionChatButtonContainer);

    const newMessageInput = document.getElementById('new_message');
    showElement(newMessageInput);
    // block panel
    disabledDashboard();
};

const showVideoCallElements = () => {
    const callButtons = document.getElementById('call_buttons');
    showElement(callButtons);

    const placeHolder = document.getElementById('video_placeholder');
    hideElement(placeHolder);

    const remoteVideo = document.getElementById('remote_video');
    showElement(remoteVideo);

    const newMessageInput = document.getElementById('new_message');
    showElement(newMessageInput);
    // block panel
    disabledDashboard();
};

// ui call buttons

const micOnImgSrc = "./utils/images/mic.png";
const micOffImgSrc = "./utils/images/micOff.png";

// atulizando o botao mic de acordo com o status ativo
export const updateMicButton = (micActive) => {
    const micButtonImage = document.getElementById('mic_button_image');
    micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc;
};

const cameraOnImgSrc = "./utils/images/camera.png";
const cameraOffImgSrc = "./utils/images/cameraOff.png";

// atulizando o botao da camera de acordo com o status ativo
export const updateCameraButton = (cameraActive) => {
    const cameraButtonImage = document.getElementById('camera_button_image');
    cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc;
};

// ui messages
export const appendMessage = (message, right = false) => {
    const messagesContainer = document.getElementById('messages_container');
    const messageElement = right
        ? elements.getRightMessage(message)
        : elements.getLeftMessage(message);
    messagesContainer.appendChild(messageElement);
};

export const clearMessenger = () => {
    const messagesContainer = document.getElementById('messages_container');
    messagesContainer.querySelectorAll('*').forEach((n) => n.remove());
};

// recording
export const showRecordingPanel = () => {
    const recordingButtons = document.getElementById('video_recording_buttons');
    showElement(recordingButtons);

    // ocultando o butão de start recording se gravação ativa
    const startRecordingButton = document.getElementById('start_recording_button');
    hideElement(startRecordingButton);
}

// escontendo controle de gravação e exibindo botão de start
export const resetRecordingButtons = () => {
    const stratRecordingButton = document.getElementById('start_recording_button');
    const recordingButtons = document.getElementById('video_recording_buttons');
    
    hideElement(recordingButtons);
    showElement(stratRecordingButton);
};

// alternando botão de pausa e resumo de acordo com botão ativo
export const switchRecordingButtons = (switchForResumeButton = false) => {
    const resumeButton = document.getElementById('resume_recording_button');
    const pauseButton = document.getElementById('pause_recording_button');

    if (switchForResumeButton) {
        hideElement(pauseButton);
        showElement(resumeButton);
    } else {
        hideElement(resumeButton);
        showElement(pauseButton);
    }
};

// ui after hanged up
export const updateUIAfterHangUp = (callType) => {
    enableDashboard();

    // hide the call buttons
    if (
        callType === constants.callType.VIDEO_PERSONAL_CODE ||
        callType === constants.callType.VIDEO_STRANGER
    ){
        const callButtons = document.getElementById('call_buttons');
        hideElement(callButtons);
    }else{
        const chatCallButtons = document.getElementById('finish_chat_button_container');
        hideElement(chatCallButtons);
    }

    const newMessageInput = document.getElementById('new_message');
    hideElement(newMessageInput);
    clearMessenger();

    updateMicButton(false);
    updateCameraButton(false);

    // hide remote video and show placeholder
    const remoteVideo = document.getElementById('remote_video');
    hideElement(remoteVideo);

    const placeHolder = document.getElementById('video_placeholder');
    showElement(placeHolder);

    removeAllDialogs();
};

// changing status of checkbox
export const updateStrangerCheckbox = (allowConnections) => {
    const checkBoxCheckImg = document.getElementById('allow_strangers_checkbox_image');
    
    allowConnections ? showElement(checkBoxCheckImg) : hideElement(checkBoxCheckImg);
};

// ui helper functions

const enableDashboard = () => {
    const dashBoardBlocker = document.getElementById('dashboard_blur');
    if (!dashBoardBlocker.classList.contains('display_none')) {
        dashBoardBlocker.classList.add('display_none');
    }
};

const disabledDashboard = () => {
    const dashBoardBlocker = document.getElementById('dashboard_blur');
    if (dashBoardBlocker.classList.contains('display_none')) {
        dashBoardBlocker.classList.remove('display_none');
    }
};

const hideElement = (element) => {
    if (!element.classList.contains('display_none')) {
        element.classList.add('display_none');
    }
};

const showElement = (element) => {
    if (element.classList.contains('display_none')) {
        element.classList.remove('display_none');
    }
};
