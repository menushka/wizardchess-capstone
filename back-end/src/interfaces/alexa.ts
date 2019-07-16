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
    piece: ChessPiece;
    location: {
        from: BoardLocation;
        to: BoardLocation;
    };
}

export interface IAlexaSurrender {
    userId: string;
}
