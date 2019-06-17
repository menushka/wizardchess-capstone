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

    private setGameForPlayer(socketId: string, gameId: string) {
        this.playerGames[socketId] = gameId;
    }

    private attachSocketListeners(socketId: string) {
        this.playerSockets[socketId].on(Events.START_GAME, (data: IStartGame) => {
            const game = GameManager.instance.startGame(socketId, data.type);
            this.setGameForPlayer(socketId, game.id);
            this.send(socketId, Events.GAME_STARTED, {
                gameId: game.id,
                board: game.boardState
            } as IGameStarted);
        });

        this.playerSockets[socketId].on(Events.JOIN_GAME, (data: IJoinGame) => {
            GameManager.instance.joinGame(socketId, data.gameId, (gameId: string) => {
                this.playerGames[socketId] = gameId;
            });
        });

        this.playerSockets[socketId].on(Events.CHESS_PIECE_MOVED, (data: IChessPieceMoved) => {
            GameManager.instance.moveChessPiece(this.playerGames[socketId], data.piece, data.location);
        });

        this.playerSockets[socketId].on(Events.SURRENDER_GAME, (data: ISurrenderGame) => {
            GameManager.instance.surrender(socketId, this.playerGames[socketId]);
        });
    }

    private send(socketId: string, eventName: string, data: any) {
        this.playerSockets[socketId].emit(eventName, data);
    }
}
