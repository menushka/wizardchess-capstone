import { BoardLocation, ChessPiece, IChessBoard } from "./general";

export interface IConnect {}

export interface IConnectionEstablished {}

export interface IStartGame {
    type: number;
}

export interface IGameStarted {
    gameID: string;
    board: IChessBoard;
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
