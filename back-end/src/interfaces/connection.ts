import { ChessLocation, ChessPiece, IChessBoard } from "./general";

export interface IConnect {}

export interface IConnectionEstablished {}

export interface IStartGame {
    type: number;
}

export interface IGameStarted {
    gameID: string;
    board: IChessBoard;
}

export interface IChessBoardMoved {
    gameID: string;
    piece: ChessPiece;
    location: ChessLocation;
}

export interface IBoardStateUpdate {
    board: IChessBoard;
}
