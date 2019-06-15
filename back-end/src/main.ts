import express from "express";
import http from "http";
import socketio from "socket.io";

import { Config } from "./config";

const expressServer = express();
const httpServer = http.createServer(expressServer);
const socket = socketio(httpServer);

httpServer.listen(Config.PORT, () => {
    console.log("Server started on port:" + Config.PORT);
});
