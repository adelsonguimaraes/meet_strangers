import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";

let connectedUserDetails;

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
        wss.sendPreOffer(data);
    }
};

export const handlePreOffer = (data) => {
    const { callType, callerSocketId } = data;

    connectedUserDetails = {
        socketId: callerSocketId,
        callType
    };

    if (
        callType === constants.callType.CHAT_PERSONAL_CCODE ||
        callType === constants.callType.VIDEO_PERSONAL_CODE
    ){
        console.log('Showing call dialog');
        ui.showIncomingDialog(callType, acceptCallHandler, rejectCallHandler);
    }
};

const acceptCallHandler = () => {
    console.log("call accepted");
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
};

const rejectCallHandler = () => {
    console.log("call rejected");
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

const callingDialogRejectCallHandler = () => {
    console.log("rejecting the call");
};

const sendPreOfferAnswer = (preOfferAnswer) => {
    const data = {
        callerSocketId: connectedUserDetails.socketId,
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
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        // show dialog that callee is not able to connect

        // chamando a função que mostra o dialogo de resposta
        // para quem fez a chamada
        ui.showInfoDialog(preOfferAnswer);
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        // show dialog that call is rejected by the callee

        // chamando a função que mostra o dialogo de resposta
        // para quem fez a chamada
        ui.showInfoDialog(preOfferAnswer);
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
        // send webRTC offer
    }
};