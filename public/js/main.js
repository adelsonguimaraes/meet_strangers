import * as store from './store.js';
import * as wss from './wss.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as constants from './constants.js';
import * as ui from './ui.js';
import * as recordingUtils from './recordingUtills.js';

const socket = io("/");
// resgistrando o socket
wss.registerSocketEvents(socket);

webRTCHandler.getLocalPreview();

// função para copiar o código de socket quando clicar no botão de copia
const personalCodeCopyButton = document.getElementById('personal_code_copy_button');
personalCodeCopyButton.addEventListener('click', () => {
    const personalCode = store.getState().socketId;
    navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

// função dos botões de conexão
const personalCodeChatButton = document.getElementById("personal_code_chat_button");
const personalCodeVideoButton = document.getElementById("personal_code_video_button");

// função de chamada via chat
personalCodeChatButton.addEventListener('click', () => {
    console.log('chat button clicked');

    const calledPersonalCode = document.getElementById("personal_code_input").value;
    const callType = constants.callType.CHAT_PERSONAL_CCODE;

    webRTCHandler.sendPreOffer(callType, calledPersonalCode);
});

// função de chamada vida video
personalCodeVideoButton.addEventListener('click', () => {
    console.log('video button clicked');
    
    const calledPersonalCode = document.getElementById("personal_code_input").value;
    const callType = constants.callType.VIDEO_PERSONAL_CODE;

    webRTCHandler.sendPreOffer(callType, calledPersonalCode);
});

// escutando eventos de botões de vídeo

const micButton = document.getElementById('mic_button');
micButton.addEventListener('click', () => {
    const localStream = store.getState().localStream;
    const micEnabled = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !micEnabled;
    ui.updateMicButton(micEnabled);
});

const cameraButton = document.getElementById('camera_button');
cameraButton.addEventListener('click', () => {
    const localStream = store.getState().localStream;
    const cameraEnabled = localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;
    ui.updateCameraButton(cameraEnabled);
});

const switchForScreenSharingButton = document.getElementById(
    'screen_sharing_button'
);
switchForScreenSharingButton.addEventListener('click', () => {
    const screenSharingActive = store.getState().screenSharingActive;
    webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
});

// messenger

// pegando eventos de digitação na caixa de texto de mensagem
const newMessageInput = document.getElementById('new_message_input');
newMessageInput.addEventListener('keydown', (event) => {
    console.log('change ocurred');
    const key = event.key;

    // quando a tecla pressionanda na caixa de menssagem for enter
    if (key === "Enter") {
        // envia a mensagem para o canal de dados
        webRTCHandler.sendMessageUsingDataChannel(event.target.value);
        // envia a mensagem para ser escrita na tela
        ui.appendMessage(event.target.value, true);
        // limpa a caixa de texto
        newMessageInput.value = '';
    }
});

// quando o botão de enviar mensagem for cliclado
const sendMessageButton = document.getElementById('send_message_button');
sendMessageButton.addEventListener('click', () => {
    // pegando a mensagem da caixa de texto
    const message = newMessageInput.value;
    // enviando a mensagem para o canal de dados
    webRTCHandler.sendMessageUsingDataChannel(message);
    // envia a mensagem para ser escrita na tela
    ui.appendMessage(message, true);
    // limpando a caixa de texto
    newMessageInput.value = '';
});

// recording

// pegando o botão de start da gravação e escutando o evento click
const startRecordingButton = document.getElementById('start_recording_button');
startRecordingButton.addEventListener('click', () => {
    // iniciando a gravação do video
    recordingUtils.startRecording();
    // exibindo controle de gravação de vídeo
    ui.showRecordingPanel();
});

// pegando o botão de stop de gravação e escutando e evento click
const stopRecordingButton = document.getElementById('stop_recording_button');
stopRecordingButton.addEventListener('click', () => {
    // parando a gravação de video
    recordingUtils.stopRecording();
    // removendo botões de controle de gravação
    ui.resetRecordingButtons();
});

// pegando botão de pausa de gravação e escutando evento de click
const pauseRecordingButton = document.getElementById('pause_recording_button');
pauseRecordingButton.addEventListener('click', () => {
    // pausando a gravação de video
    recordingUtils.pauseRecording();
    // exibindo botão de play/resumo

    ui.switchRecordingButtons(true);
});

// pegando botão de resumir gravacao e escutando evento click
const resumeRecordingButton = document.getElementById('resume_recording_button');
resumeRecordingButton.addEventListener('click', () => {
    // continuando com a gravacao de video
    recordingUtils.resumeRecording();
    // exibindo botão de pausa
    ui.switchRecordingButtons();
});

// hang up - evento de click para desligar a chamada

const hangUpButton = document.getElementById('hang_up_button');
hangUpButton.addEventListener('click', () => {
    webRTCHandler.handleHangUp();
});

const hangUpChatButton = document.getElementById('finish_chat_call_button');
hangUpChatButton.addEventListener('click', () => {
    webRTCHandler.handleHangUp();
});