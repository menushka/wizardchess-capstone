import { Events } from "../events";
import { IBoardStateUpdate } from "../interfaces/connection";
import { GameManager } from "./gameManager";

export class SocketManager {

    public static instance: SocketManager;

    private playerSockets: { [id: string]: SocketIO.Socket }  = {};
    private alexaSocket: SocketIO.Socket;
    private viewerSockets: { [gameId: string]: SocketIO.Socket[] }  = {};

    constructor() {
        SocketManager.instance = this;
    }

    public addUser(socket: SocketIO.Socket) {
        this.playerSockets[socket.id] = socket;
    }

    public addAlexaSocket(socket: SocketIO.Socket) {
        this.alexaSocket = socket;
    }

    public addViewer(gameId: string, socket: SocketIO.Socket) {
        if (gameId in this.viewerSockets) {
            this.viewerSockets[gameId].push(socket);
        } else {
            this.viewerSockets[gameId] = [socket];
        }
        const game = GameManager.instance.getGame(gameId);
        if (game) {
            socket.emit(Events.BOARD_STATE_UPDATE, {
                status: game.state,
                board: game.boardState
            } as IBoardStateUpdate);
        }
    }

    public send(userIds: string[], eventName: string, data: any, gameId?: string) {
        for (const userId of userIds) {
            if (userId in this.playerSockets) {
                this.playerSockets[userId].emit(eventName, data);
            } else {
                data.userId = userId;
                if (this.alexaSocket) {
                    this.alexaSocket.emit(eventName, data);
                }
            }
        }
        if (gameId && gameId in this.viewerSockets) {
            for (const socket of this.viewerSockets[gameId]) {
                socket.emit(eventName, data);
            }
        }
    }
}