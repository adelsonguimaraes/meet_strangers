import * as store from './store.js';
import * as wss from './wss.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as constants from './constants.js';

const socket = io("/");
// resgistrando o socket
wss.registerSocketEvents(socket);

// função para copiar o código de socket quando clicar no botão de copia
const personalCodeCopyButton = document.getElementById('personal_code_copy_button');
personalCodeCopyButton.addEventListener('click', () => {
    const personalCode = store.getState().socketId;
    navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

// função dos botões de conexão
const personalCodeChatButton = document.getElementById("personal_code_chat_button");

const personalCodeVideoButton = document.getElementById("personal_code_video_button");

personalCodeChatButton.addEventListener('click', () => {
    console.log('chat button clicked');

    const calledPersonalCode = document.getElementById("personal_code_input").value;
    const callType = constants.callType.CHAT_PERSONAL_CCODE;

    webRTCHandler.sendPreOffer(callType, calledPersonalCode);
});

personalCodeVideoButton.addEventListener('click', () => {
    console.log('video button clicked');
    
    const calledPersonalCode = document.getElementById("personal_code_input").value;
    const callType = constants.callType.VIDEO_PERSONAL_CODE;

    webRTCHandler.sendPreOffer(callType, calledPersonalCode);
});