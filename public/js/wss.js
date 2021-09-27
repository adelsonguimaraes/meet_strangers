import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";

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
}

export const sendPreOffer = (data) => {
    console.log("emmiting to server pre offer event");
    // emitindo sinal de pre oferta
    socketIO.emit("pre-offer", data);
};