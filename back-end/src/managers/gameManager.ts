import { ChessBoard } from "../data/chessboard";
import { BoardLocation, ChessPiece, GameType } from "../interfaces/general";

export class GameManager {

    public static instance: GameManager;

    private games: { [id: string]: ChessBoard } = {};

    constructor() {
        GameManager.instance = this;
    }

    public getGame(gameId: string): ChessBoard {
        return this.games[gameId];
    }

    public startGame(userId: string, type: GameType) {
        return this.createNewGame(userId, type);
    }

    public joinGame(userId: string, gameId: string, cb: (gameId: string) => void) {
        if (this.games[gameId]) {
            this.games[gameId].join(userId);
            cb(gameId);
        }
    }

    public moveChessPiece(gameId: string, chessPiece: ChessPiece, boardLocation: BoardLocation) {
        this.games[gameId].movePiece();
    }

    public surrender(gameId: string, userId: string) {
        this.games[gameId].surrender(userId);
    }

    private createNewGame(userId: string, type: GameType): ChessBoard {
        const code = this.generateGameID();
        const board = new ChessBoard(userId, type, code);
        this.games[code] = board;
        return board;
    }

    private generateGameID(): string {
        let gameCode = Math.floor(1000 + Math.random() * 9000);
        while (String(gameCode) in this.games) {
            gameCode = Math.floor(1000 + Math.random() * 9000);
        }
        return String(gameCode);
    }
}
