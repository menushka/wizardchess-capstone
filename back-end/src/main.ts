import express from "express";
import http from "http";
import path from "path";
import socketIO from "socket.io";

import { Config } from "./config";
import { Events } from "./events";
import { AlexaManager } from "./managers/alexaManager";
import { GameManager } from "./managers/gameManager";
import { PlayerManager } from "./managers/playerManager";
import { SocketManager } from "./managers/socketManager";
import { StockfishManager } from "./managers/stockfishManager";

const socketManager = new SocketManager();
const alexaManager = new AlexaManager();
const gameManager = new GameManager();
const playerManager = new PlayerManager();
const stockfishManager = new StockfishManager();

const expressServer = express();
const httpServer = http.createServer(expressServer);
const io = socketIO(httpServer);

io.on(Events.CONNECTION, (socket: SocketIO.Socket) => {
    const clientType = socket.handshake.query.client;
    if (clientType === Config.CLIENT_TYPE_ALEXA) {
        alexaManager.setSocket(socket);
    } else if (clientType === Config.CLIENT_TYPE_PLAYER) {
        playerManager.addPlayer(socket);
    } else if (clientType === Config.CLIENT_TYPE_VIEWER) {
        const gameId = socket.handshake.query.gameId;
        socketManager.addViewer(gameId, socket);
    } else {
        console.log("Unrecognized client type connection");
    }
});

expressServer.get("/game/", (request, response) => {
    response.sendFile(path.join(__dirname, "../../front-end/testing/game.html"));
});

expressServer.get("/game/:id", (request, response) => {
    const id = request.params.id;
    const game = GameManager.instance.getGame(id);
    if (game) {
        response.sendFile(path.join(__dirname, "../../front-end/testing/viewer.html"));
    } else {
        response.send("No game found for " + id);
    }
});

httpServer.listen(Config.PORT, () => {
    console.log("Server started on port:" + Config.PORT);
});