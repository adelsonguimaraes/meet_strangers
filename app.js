const express = require("express");
const http = require("http");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

let connectedPeers = [];
let connectedPeersStrangers = [];

// envenco de conexão do socket
io.on("connection", (socket) => {
    // adicionando o id do socket ao array de peers conectados
    connectedPeers.push(socket.id);
    console.log(connectedPeers);

    // recebendo emissão de sinal de pre-oferta
    socket.on("pre-offer", (data) => {
        console.log("pre-offer-came");
        const { calledPersonalCode, callType } = data;

        // consultando o socketid de quem deve receber a oferta
        // entre os conectados
        const connectedPeer = connectedPeers.find((peerSocketId) => 
            peerSocketId === calledPersonalCode
        );

        // se encontrar entre os conectados
        if (connectedPeer) {
            const data = {
                callerSocketId: socket.id,
                callType
            };

            // emite um sinal para com a oferta
            // enviando o id do emissor e o tipo de chamada
            io.to(calledPersonalCode).emit('pre-offer', data);
        }else{
            // se o id chamado não for encontrado entre os conectados
            // respondemos com para quem chama, informando que não foi encontrado
            const data = {
                preOfferAnswer: 'CALLEE_NOT_FOUND'
            };
            io.to(socket.id).emit('pre-offer-answer', data);
        }
    });

    // recebendo emissão de sinal de pre-resposta
    socket.on('pre-offer-answer', (data) => {
        const { callerSocketId } = data;

        // consultando o socketid de quem deve receber a oferta
        // entre os conectados
        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === callerSocketId
        );

        if (connectedPeer) {
            // se o peer estiver entre os conectados, emitimos
            // um sinal de resposta com as informações de data
            io.to(data.callerSocketId).emit('pre-offer-answer', data);
        }
    });

    // recebendo emissão de sinal webrtc
    socket.on('webRTC-signaling', (data) => {
        const { connectedUserSocketId } = data;

        // consultando o socketid entre os conectados
        // de quem deve receber o data
        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === connectedUserSocketId
        );

        if (connectedPeer) {
            // se o peer estiver entre os conectados, emitimos
            // o sinal com os dados webrtc e informações de data
            io.to(connectedUserSocketId).emit('webRTC-signaling', data);
        }
    });

    // recebendo sinal de desligamento da chamada
    socket.on('user-hanged-up', (data) => {
        // desestruturando o connectedSocketId
        const { connectedUserSocketId } = data;

        // verificando se está entre os conectados
        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === connectedUserSocketId
        );

        if (connectedPeer) {
            // se estiver entre os conectados emit um sinal
            io.to(connectedUserSocketId).emit('user-hanged-up');
        }
    });

    // recebendo sinal de conexao liberada para estranhos
    socket.on('stranger-connection-status', (data) => {
        const { status } = data;
        if (status) {
            connectedPeersStrangers.push(socket.id);
        }else {
            const newConnectedPeersStrangers = connectedPeersStrangers.filter(
                (peerSocketId) => peerSocketId !== socket.id
            );

            connectedPeersStrangers = newConnectedPeersStrangers;
        }

        console.log(connectedPeersStrangers);
    });

    // recebendo sinal de socket de estranho recebido
    socket.on('get-stranger-socket-id', () => {

        let randomStrangerSocketId;
        
        // capturando o socketid do peer no array, caso seja diferente do peer que chama
        const filteredConnectedPeersStrangers = connectedPeersStrangers.filter(
            (peerSocketId) => peerSocketId !== socket.id
        );

        // se o socketid for capturado gerando um randomico strangersocketid
        if (filteredConnectedPeersStrangers.length > 0) {
            randomStrangerSocketId = filteredConnectedPeersStrangers[
                Math.floor(Math.random() * filteredConnectedPeersStrangers.length)
            ];
        }else{
            // ou setando como nulo
            randomStrangerSocketId = null;
        }

        const data = {
            randomStrangerSocketId  
        };

        // emitindo um sinal de resposta com o socketid encontrado
        io.to(socket.id).emit('stranger-socket-id', data);
    });

    // pegando o evento de desconexão
    socket.on("disconnect", () => {
        console.log("user disconnected");

        // removendo do array o peer desconectado
        const newConnectedPeers = connectedPeers.filter(
            (peerSocketId) => peerSocketId !== socket.id
        );
        connectedPeers = newConnectedPeers;
        
        const newConnectedPeersStrangers = connectedPeersStrangers.filter(
            (peerSocketId) => peerSocketId !== socket.id
        );
        connectedPeersStrangers = newConnectedPeersStrangers;
    });
});

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});