import { BoardLocation, ChessPiece } from "./general";

export interface IAlexaConnection {
    userId: string;
}

export interface IAlexaStart {
    userId: string;
    type: number;
}

export interface IAlexaJoin {
    userId: string;
    gameId: string;
}

export interface IAlexaMovePiece {
    userId: string;
    chessPiece: ChessPiece;
    boardPosition: BoardLocation;
}

export interface IAlexaSurrender {
    userId: string;
}
