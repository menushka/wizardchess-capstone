import { ChessBoard } from "../data/chessboard";
import { Events } from "../events";
import { IChessPieceMoved, IGameStarted, IJoinGame, IStartGame, ISurrenderGame } from "../interfaces/connection";
import { GameManager } from "./gameManager";

export class PlayerManager {

    public static instance: PlayerManager;

    private playerSockets: { [id: string]: SocketIO.Socket }  = {};
    private playerGames: { [id: string]: string }  = {};

    constructor() {
        PlayerManager.instance = this;
    }

    public addPlayer(socket: SocketIO.Socket) {
        this.playerSockets[socket.id] = socket;
        this.playerGames[socket.id] = null;
        this.attachSocketListeners(socket.id);
    }

    public clearGame(userId: string) {
        if (!(userId in this.playerGames)) { return; }
        this.playerGames[userId] = null;
    }

    private setGameForPlayer(socketId: string, gameId: string) {
        this.playerGames[socketId] = gameId;
    }

    private attachSocketListeners(socketId: string) {
        this.playerSockets[socketId].on(Events.START_GAME, (data: IStartGame) => {
            const game = GameManager.instance.startGame(socketId, data.type);
            this.setGameForPlayer(socketId, game.id);
            this.send(socketId, Events.START_GAME_CONFIRM, {
                gameId: game.id,
                board: game.boardState
            } as IGameStarted);
        });

        this.playerSockets[socketId].on(Events.JOIN_GAME, (data: IJoinGame) => {
            GameManager.instance.joinGame(socketId, data.gameId, (game: ChessBoard) => {
                this.playerGames[socketId] = game.id;
                this.send(socketId, Events.JOIN_GAME_CONFIRM, {
                    gameId: game.id,
                    board: game.boardState
                });
            });
        });

        this.playerSockets[socketId].on(Events.CHESS_PIECE_MOVED, async (data: IChessPieceMoved) => {
            const game = await GameManager.instance.moveChessPiece(
                socketId,
                this.playerGames[socketId],
                data.piece,
                data.location
            );
            setTimeout(() => {
                this.send(socketId, Events.CHESS_PIECE_MOVED_CONFIRM, {
                    board: game.boardState,
                    fen: game.fen
                });
            }, 6666);
        });

        this.playerSockets[socketId].on(Events.SURRENDER_GAME, (data: ISurrenderGame) => {
            GameManager.instance.surrender(this.playerGames[socketId], socketId);
            this.send(socketId, Events.SURRENDER_GAME_CONFIRM, {});
        });
    }

    private send(socketId: string, eventName: string, data: any) {
        this.playerSockets[socketId].emit(eventName, data);
    }
}
