import { BoardLocation, ChessColor, ChessPiece, IChessBoard } from "./general";

export interface IConnect {}

export interface IConnectionEstablished {}

export interface IStartGame {
    type: number;
}

export interface IStartGameConfirm {
    gameId: string;
    status: string;
    board: string;
}

export interface IJoinGame {
    gameId: string;
}

export interface IJoinGameConfirm {
    gameId: string;
    status: string;
    board: string;
}

export interface IChessPieceMoved {
    piece: ChessPiece;
    location: {
        from: BoardLocation;
        to: BoardLocation;
    };
}

export interface ISurrenderGame {}

export interface IBoardStateUpdate {
    status: string;
    board: string;
}
