import { Events } from "../events";
import { IChessPieceMoved, IJoinGame, IStartGame, ISurrenderGame } from "../interfaces/connection";
import { GameManager } from "./gameManager";

export class PlayerManager {

    public static instance: PlayerManager;

    private playerSockets: { [id: string]: SocketIO.Socket }  = {};
    private playerGames: { [id: string]: number }  = {};

    constructor() {
        PlayerManager.instance = this;
    }

    public addPlayer(socket: SocketIO.Socket) {
        this.playerSockets[socket.id] = socket;
        this.playerGames[socket.id] = null;
        this.attachSocketListeners(socket.id);
    }

    private attachSocketListeners(socketId: string) {
        this.playerSockets[socketId].on(Events.START_GAME, (data: IStartGame) => {
            GameManager.instance.startGame(socketId, data.type);
        });

        this.playerSockets[socketId].on(Events.JOIN_GAME, (data: IJoinGame) => {
            GameManager.instance.joinGame(socketId, data.gameId);
        });

        this.playerSockets[socketId].on(Events.CHESS_PIECE_MOVED, (data: IChessPieceMoved) => {
            GameManager.instance.moveChessPiece(socketId, data.piece, data.location);
        });

        this.playerSockets[socketId].on(Events.SURRENDER_GAME, (data: ISurrenderGame) => {
            GameManager.instance.surrender(socketId);
        });
    }
}
