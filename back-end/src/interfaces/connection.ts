import { BoardLocation, ChessPiece, IChessBoard, ChessColor } from "./general";

export interface IConnect {}

export interface IConnectionEstablished {}

export interface IStartGame {
    type: number;
}

export interface IGameStarted {
    gameId: string;
    board: string[][];
}

export interface IJoinGame {
    gameId: string;
}

export interface IChessPieceMoved {
    piece: ChessPiece;
    location: BoardLocation;
}

export interface ISurrenderGame {}

export interface IBoardStateUpdate {
    board: IChessBoard;
}
