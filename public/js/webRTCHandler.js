import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";

let connectedUserDerails;

// enviando pre oferta para o servidor
export const sendPreOffer = (callType, calledPersonalCode) => {
    const data = {
        callType,
        calledPersonalCode
    };

    wss.sendPreOffer(data);
};

export const handlePreOffer = (data) => {
    const { callType, callerSocketId } = data;

    connectedUserDerails = {
        socketId: callerSocketId,
        callType
    };

    if (
        callType === constants.callType.CHAT_PERSONAL_CCODE ||
        callType === constants.callType.VIDEO_PERSONAL_CODE
    ){
        ui.showIncomingDialog(callType, acceptCallHandler, rejectCallHandler);
    }
};

const acceptCallHandler = () => {
    console.log("call accepted");
};

const rejectCallHandler = () => {
    console.log("call rejected");
};