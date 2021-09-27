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
        ui.showIncomingDialog(callingDialogRejectCallHandler);
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
};

const rejectCallHandler = () => {
    console.log("call rejected");
};

const callingDialogRejectCallHandler = () => {
    console.log("rejecting the call");
};