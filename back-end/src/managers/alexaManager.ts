import { Events } from "../events";
import { IAlexaConnection, IAlexaJoin, IAlexaMovePiece, IAlexaStart, IAlexaSurrender } from "../interfaces/alexa";
import { GameManager } from "./gameManager";

export class AlexaManager {

    public static instance: AlexaManager;

    private alexaSocket: SocketIO.Socket;
    private alexaPlayers: { [id: string]: string } = {};

    constructor() {
        AlexaManager.instance = this;
    }

    public setSocket(socket: SocketIO.Socket) {
        this.alexaSocket = socket;
        this.attachSocketListeners();
    }

    public getSocket() {
        return this.alexaSocket;
    }

    public addPlayer(userId: string) {
        this.alexaPlayers[userId] = null;
    }

    private attachSocketListeners() {
        this.alexaSocket.on(Events.ALEXA_CONNECTION, (data: IAlexaConnection) => {
            this.alexaPlayers[data.userId] = null;
        });

        this.alexaSocket.on(Events.START_GAME, (data: IAlexaStart) => {
            GameManager.instance.startGame(data.userId, data.type);
        });

        this.alexaSocket.on(Events.JOIN_GAME, (data: IAlexaJoin) => {
            GameManager.instance.joinGame(data.userId, data.gameId);
        });

        this.alexaSocket.on(Events.CHESS_PIECE_MOVED, (data: IAlexaMovePiece) => {
            GameManager.instance.moveChessPiece(data.userId, data.chessPiece, data.boardPosition);
        });

        this.alexaSocket.on(Events.SURRENDER_GAME, (data: IAlexaSurrender) => {
            GameManager.instance.surrender(data.userId);
        });
    }
}
