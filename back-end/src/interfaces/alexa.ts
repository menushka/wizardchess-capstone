export interface IAlexaConnection {
    userId: string;
}

export interface IAlexaJoin {
    userId: string;
    gameId: string;
}

export interface IAlexaMovePiece {
    userId: string;
    chessPiece: string;
    boardPosition: string;
}
