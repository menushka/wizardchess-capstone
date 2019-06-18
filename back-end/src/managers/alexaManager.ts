import { ChessBoard } from "../data/chessboard";
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

    public clearGame(userId: string) {
        if (!(userId in this.alexaPlayers)) { return; }
        this.alexaPlayers[userId] = null;
    }

    private setGameForPlayer(userId: string, gameId: string) {
        this.alexaPlayers[userId] = gameId;
    }

    private attachSocketListeners() {
        this.alexaSocket.on(Events.ALEXA_CONNECTION, (data: IAlexaConnection) => {
            this.addPlayer(data.userId);
            this.send(data.userId, Events.ALEXA_CONNECTION_CONFIRM, {});
        });

        this.alexaSocket.on(Events.START_GAME, (data: IAlexaStart) => {
            const game = GameManager.instance.startGame(data.userId, data.type);
            this.setGameForPlayer(data.userId, game.id);
            this.send(data.userId, Events.START_GAME_CONFIRM, {
                gameId: game.id,
                board: game.boardState
            } as IGameStarted);
        });

        this.alexaSocket.on(Events.JOIN_GAME, (data: IAlexaJoin) => {
            GameManager.instance.joinGame(data.userId, data.gameId, (game: ChessBoard) => {
                this.alexaPlayers[data.userId] = game.id;
                this.send(data.userId, Events.JOIN_GAME_CONFIRM, {
                    gameId: game.id,
                    board: game.boardState
                });
            });
        });

        this.alexaSocket.on(Events.CHESS_PIECE_MOVED, (data: IAlexaMovePiece) => {
            const game = GameManager.instance.moveChessPiece(
                data.userId,
                this.alexaPlayers[data.userId],
                data.chessPiece,
                data.boardPosition
            ).then(game => {
                this.send(data.userId, Events.CHESS_PIECE_MOVED_CONFIRM, {
                    board: game.boardState
                });
            });
        });

        this.alexaSocket.on(Events.SURRENDER_GAME, (data: IAlexaSurrender) => {
            GameManager.instance.surrender(this.alexaPlayers[data.userId], data.userId);
            this.send(data.userId, Events.SURRENDER_GAME_CONFIRM, {});
        });
    }

    private send(userId: string, eventName: string, data: any) {
        data.userId = userId;
        console.log(eventName + " - " + data);
        this.alexaSocket.emit(eventName, data);
    }
}
