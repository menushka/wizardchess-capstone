import { IChessBoard } from "../interfaces/general";

export class ChessBoard implements IChessBoard {
    public boardState: number[][];
    public currentTurn: number;

    constructor() {
        this.boardState = [];
        this.currentTurn = 0;
    }
}
