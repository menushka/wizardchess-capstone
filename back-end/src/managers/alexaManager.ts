import { Events } from "../events";
import { IAlexaConnection, IAlexaJoin, IAlexaMovePiece, IAlexaStart, IAlexaSurrender } from "../interfaces/alexa";
import { IGameStarted } from "../interfaces/connection";
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

    private setGameForPlayer(userId: string, gameId: string) {
        this.alexaPlayers[userId] = gameId;
    }

    private attachSocketListeners() {
        this.alexaSocket.on(Events.ALEXA_CONNECTION, (data: IAlexaConnection) => {
            this.addPlayer(data.userId);
        });

        this.alexaSocket.on(Events.START_GAME, (data: IAlexaStart) => {
            const game = GameManager.instance.startGame(data.userId, data.type);
            this.setGameForPlayer(data.userId, game.id);
            this.send(data.userId, Events.GAME_STARTED, {
                gameId: game.id,
                board: game.boardState
            } as IGameStarted);
        });

        this.alexaSocket.on(Events.JOIN_GAME, (data: IAlexaJoin) => {
            GameManager.instance.joinGame(data.userId, data.gameId, (gameId: string) => {
                this.alexaPlayers[data.userId] = gameId;
            });
        });

        this.alexaSocket.on(Events.CHESS_PIECE_MOVED, (data: IAlexaMovePiece) => {
            GameManager.instance.moveChessPiece(this.alexaPlayers[data.userId], data.chessPiece, data.boardPosition);
        });

        this.alexaSocket.on(Events.SURRENDER_GAME, (data: IAlexaSurrender) => {
            GameManager.instance.surrender(data.userId, this.alexaPlayers[data.userId]);
        });
    }

    private send(userId: string, eventName: string, data: any) {
        data.userId = userId;
        this.alexaSocket.emit(eventName, data);
    }
}
