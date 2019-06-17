import express from "express";
import http from "http";
import socketIO from "socket.io";

import { Config } from "./config";
import { Events } from "./events";
import { AlexaManager } from "./managers/alexaManager";
import { GameManager } from "./managers/gameManager";
import { PlayerManager } from "./managers/playerManager";

const alexaManager = new AlexaManager();
const gameManager = new GameManager();
const playerManager = new PlayerManager();

const expressServer = express();
const httpServer = http.createServer(expressServer);
const io = socketIO(httpServer);

io.on(Events.CONNECTION, (socket: SocketIO.Socket) => {
    const clientType = socket.handshake.query.client;
    if (clientType === Config.CLIENT_TYPE_ALEXA) {
        alexaManager.setSocket(socket);
    } else if (clientType === Config.CLIENT_TYPE_PLAYER) {
        playerManager.addPlayer(socket);
    } else {
        console.log("Unrecognized client type connection");
    }
});

expressServer.get("/game/:id", (request, response) => {
    const id = request.params.id;
    const game = GameManager.instance.getGame(id);
    if (game) {
        let res = "<table style='text-align: center;'>";
        for (const row of game.boardState) {
            res += "<tr>";
            for (const location of row) {
                res += "<td>" + (location === "" ? "--" : location) + "</td>";
            }
            res += "</tr>";
        }
        res += "</table>";
        response.send(res);
    } else {
        response.send("No game found for " + id);
    }
});

httpServer.listen(Config.PORT, () => {
    console.log("Server started on port:" + Config.PORT);
});
