import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";

let socketIO = null;

// evento que registra o socket io
export const registerSocketEvents = (socket) => {
    socketIO = socket;

    // conectando ao servidor de socket
    socket.on("connect", () => {
        // alimentando variavel com socket
        
        console.log("succesfully connected to socket.io server");
        // adicionando o socket no store
        store.setSocketId(socket.id);
        // escrevendo o id do socket na tela
        ui.updatePersonalCode(socket.id);
    });

    // recebendo o final de pre oferta
    socket.on("pre-offer", (data) => {
        webRTCHandler.handlePreOffer(data);
    });

    // recebendo a resposta
    socket.on('pre-offer-answer', (data) => {
        webRTCHandler.handlePreOfferAnswer(data);
    });

    // recebendo sinal de desligamento da chamada
    socket.on('user-hanged-up', () => {
        // chamando desligamento
        console.log('recebendo sinal de desligamento');
        webRTCHandler.handleConnectedUserHangedUp();
    });

    // recebendo o sinal de dados rtc
    socket.on('webRTC-signaling', (data) => {
        switch (data.type) {
            case constants.webRTCSignaling.OFFER:
                webRTCHandler.handleWebRTCOffer(data);
                break;
            case constants.webRTCSignaling.ANSWER:
                webRTCHandler.handleWebRTCAnswer(data);
                break;
            case constants.webRTCSignaling.ICE_CANDIDATE:
                webRTCHandler.handleWebRTCCandidate(data);
                break;
            default:
                return;

        }
    });
}

export const sendPreOffer = (data) => {
    console.log("emmiting to server pre offer event");
    // emitindo sinal de pre oferta
    socketIO.emit("pre-offer", data);
};

export const sendPreOfferAnswer = (data) => {
    // emitindo resposta ao sinal de oferta
    socketIO.emit('pre-offer-answer', data);
};

export const sendDataUsingWebRTCSignaling = (data) => {
    socketIO.emit('webRTC-signaling', data);
};

export const sendUserHangedUp = (data) => {
    socketIO.emit('user-hanged-up', data);
};