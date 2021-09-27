import * as constants from "./constants.js";
import * as elements from "./elements.js";

export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById("personal_code_paragraph");
    personalCodeParagraph.innerHTML = personalCode;
}

export const showIncomingDialog = (
    callType,
    acceptCallHandler,
    rejectCallHandler
) => {
    const callTypeInfo = callType === constants.callType.CHAT_PERSONAL_CCODE ? 'CHAT' : 'VIDEO';

    const InommingCallDialog = elements.getIncommingCallDialog(
        callTypeInfo,
        acceptCallHandler,
        rejectCallHandler
    );

    // removendo todos os dialogos de chamada
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
    
    dialog.appendChild(InommingCallDialog);
};

export const showCallingDialog = (rejectCallHandler) => {
    const callingDialog = elements.getCallingDialog(rejectCallHandler);
    
    // removendo todos os dialogos de chamada
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
    
    dialog.appendChild(InommingCallDialog);
};