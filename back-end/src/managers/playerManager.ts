import io from "socket.io";

import { ChessBoard } from "../data/chessboard";
import { Events } from "../events";
import { IBoardStateUpdate, IChessPieceMoved, IJoinGame, IStartGame, IStartGameConfirm, ISurrenderGame } from "../interfaces/connection";
import { GameManager } from "./gameManager";
import { SocketManager } from "./socketManager";

export class PlayerManager {

    public static instance: PlayerManager;
    private playerRoom: { [id: string]: string }  = {};

    constructor() {
        PlayerManager.instance = this;
    }

    public addPlayer(socket: SocketIO.Socket) {
        SocketManager.instance.addUser(socket);
        this.attachSocketListeners(socket);
    }

    public clearGame(userId: string) {
        const currentRoom = this.playerRoom[userId];
    }

    private setGameForPlayer(socketId: string, gameId: string) {
        this.playerRoom[socketId] = gameId;
    }

    private attachSocketListeners(socket: SocketIO.Socket) {
        SocketManager.instance.send([socket.id], Events.CONNECTION_CONFIRM, {});
        socket.on(Events.START_GAME, (data: IStartGame) => {
            const game = GameManager.instance.startGame(socket.id, data.type);
            this.setGameForPlayer(socket.id, game.id);
            SocketManager.instance.send([socket.id], Events.START_GAME_CONFIRM, {
                gameId: game.id,
                status: game.state,
                board: game.fen,
            } as IStartGameConfirm);
        });

        socket.on(Events.JOIN_GAME, (data: IJoinGame) => {
            this.setGameForPlayer(socket.id, data.gameId);
            GameManager.instance.joinGame(socket.id, data.gameId, (game: ChessBoard) => {
                SocketManager.instance.send([game.whiteUser, game.blackUser], Events.JOIN_GAME_CONFIRM, {
                    gameId: game.id,
                    status: game.state,
                    board: game.fen
                });
            });
        });

        socket.on(Events.CHESS_PIECE_MOVED, async (data: IChessPieceMoved) => {
            const game = await GameManager.instance.moveChessPiece(
                socket.id,
                this.playerRoom[socket.id],
                data.piece,
                data.location
            );

            SocketManager.instance.send([game.whiteUser, game.blackUser], Events.BOARD_STATE_UPDATE, {
                status: game.state,
                board: game.fen,
                chessHelper: game.chessHelper
            } as IBoardStateUpdate,
            game.id
            );
            /*
            setTimeout(() => {
                this.send(socketId, Events.CHESS_PIECE_MOVED_CONFIRM, {
                    board: game.boardState,
                    fen: game.fen,
                    chessHelper: game.chessHelper
                });
            }, 1000 );
            */
        });

        socket.on(Events.SURRENDER_GAME, (data: ISurrenderGame) => {
            const game = GameManager.instance.surrender(this.playerRoom[socket.id], socket.id);
            SocketManager.instance.send([game.whiteUser, game.blackUser], Events.BOARD_STATE_UPDATE, {
                status: game.state,
                board: game.fen
            } as IBoardStateUpdate,
                game.id
            );
        });
    }
}
