import { ChessBoard } from "../data/chessboard";
import { Events } from "../events";
import { IAlexaConnection, IAlexaJoin, IAlexaMovePiece, IAlexaStart, IAlexaSurrender } from "../interfaces/alexa";
import { IBoardStateUpdate, IStartGameConfirm } from "../interfaces/connection";
import { GameManager } from "./gameManager";
import { SocketManager } from "./socketManager";

export class AlexaManager {

    public static instance: AlexaManager;

    private alexaRoom: { [id: string]: string } = {};

    constructor() {
        AlexaManager.instance = this;
    }

    public setSocket(socket: SocketIO.Socket) {
        SocketManager.instance.addAlexaSocket(socket);
        this.attachSocketListeners(socket);
    }

    public addPlayer(userId: string) {
        this.alexaRoom[userId] = null;
    }

    public clearGame(userId: string) {
        if (!(userId in this.alexaRoom)) { return; }
        this.alexaRoom[userId] = null;
    }

    private setGameForPlayer(userId: string, gameId: string) {
        this.alexaRoom[userId] = gameId;
    }

    private attachSocketListeners(socket: SocketIO.Socket) {
        socket.on(Events.ALEXA_CONNECTION, (data: IAlexaConnection) => {
            this.addPlayer(data.userId);
            SocketManager.instance.send([data.userId], Events.ALEXA_CONNECTION_CONFIRM, {});
        });

        socket.on(Events.START_GAME, (data: IAlexaStart) => {
            const game = GameManager.instance.startGame(data.userId, data.type);
            this.setGameForPlayer(data.userId, game.id);
            SocketManager.instance.send([data.userId], Events.START_GAME_CONFIRM, {
                gameId: game.id,
                status: game.state,
                board: game.fen
            } as IStartGameConfirm);
        });

        socket.on(Events.JOIN_GAME, (data: IAlexaJoin) => {
            GameManager.instance.joinGame(data.userId, data.gameId, (game: ChessBoard) => {
                this.alexaRoom[data.userId] = game.id;
                SocketManager.instance.send([data.userId], Events.JOIN_GAME_CONFIRM, {
                    gameId: game.id,
                    status: game.state,
                    board: game.fen
                });
            });
        });

        socket.on(Events.CHESS_PIECE_MOVED, async (data: IAlexaMovePiece) => {
            const game = await GameManager.instance.moveChessPiece(
                data.userId,
                this.alexaRoom[data.userId],
                data.chessPiece,
                data.boardPosition
            );
            SocketManager.instance.send([data.userId], Events.CHESS_PIECE_MOVED_CONFIRM, {
                board: game.fen
            });
            SocketManager.instance.send([game.whiteUser, game.blackUser], Events.CHESS_PIECE_MOVED_CONFIRM, {
                board: game.fen
            }, game.id);
        });

        socket.on(Events.SURRENDER_GAME, (data: IAlexaSurrender) => {
            const game = GameManager.instance.surrender(this.alexaRoom[data.userId], data.userId);
            SocketManager.instance.send([data.userId], Events.SURRENDER_GAME_CONFIRM, {});
            SocketManager.instance.send([game.whiteUser, game.blackUser], Events.BOARD_STATE_UPDATE, {
                status: game.state,
                board: game.fen
            } as IBoardStateUpdate,
                game.id
            );
        });
    }
}
