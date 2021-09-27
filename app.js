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
        };
    });

    // pegando o evento de desconexão
    socket.on("disconnect", () => {
        console.log("user disconnected");

        // removendo do array o peer desconectado
        const newConnectedPeers = connectedPeers.filter(
            (peerSocketId) => peerSocketId !== socket.id
        );
        connectedPeers = newConnectedPeers;
        console.log(connectedPeers);
    });
});

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});