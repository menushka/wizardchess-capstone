import { ChessBoard } from "../data/chessboard";

export class GameModel {
    private boards: { [gameID: string]: ChessBoard };

    constructor() {}

    public newBoard(gameID: string): ChessBoard {
        const board = new ChessBoard();
        this.boards[gameID] = board;
        return board;
    }
}
