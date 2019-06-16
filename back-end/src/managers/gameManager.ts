import { ChessBoard } from "../data/chessboard";
import { BoardLocation, ChessPiece } from "../interfaces/general";

export class GameManager {

    public static instance: GameManager;

    private games: { [id: string]: ChessBoard };

    constructor() {
        GameManager.instance = this;
    }

    public newGame(): ChessBoard {
        const board = new ChessBoard();
        const code = this.generateGameID();
        this.games[code] = board;
        return board;
    }

    public startGame(userId: string, type: number) {

    }

    public joinGame(userId: string, gameId: string) {

    }

    public moveChessPiece(userId: string, chessPiece: ChessPiece, boardLocation: BoardLocation) {

    }

    public surrender(userId: string) {

    }

    private generateGameID() {
        let gameCode = Math.floor(1000 + Math.random() * 9000);
        while (String(gameCode) in this.games) {
            gameCode = Math.floor(1000 + Math.random() * 9000);
        }
        return gameCode;
    }
}
