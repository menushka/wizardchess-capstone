import express from "express";
import http from "http";
import socketio from "socket.io";

import { Config } from "./config";
import { GameModel } from "./models/gameModel";

const expressServer = express();
const httpServer = http.createServer(expressServer);
const io = socketio(httpServer);

const gameModel = new GameModel();

io.on("connection", (socket) => {
    console.log(socket.handshake.query.client);
});

httpServer.listen(Config.PORT, () => {
    console.log("Server started on port:" + Config.PORT);
});
