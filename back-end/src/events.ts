export class Events {
    // INCOMING EVENTS
    public static CONNECTION: string = "connection";
    public static ALEXA_CONNECTION: string = "alexaConnection";

    public static START_GAME: string = "startGame";
    public static JOIN_GAME: string = "joinGame";
    public static CHESS_PIECE_MOVED: string = "chessPieceMoved";
    public static SURRENDER_GAME: string = "surrenderGame";

    // OUTGOING EVENTS
    public static ALEXA_CONNECTION_CONFIRM: string = "alexaConnectionConfirm";
    public static START_GAME_CONFIRM: string = "startGameConfirm";
    public static JOIN_GAME_CONFIRM: string = "joinGameConfirm";
    public static CHESS_PIECE_MOVED_CONFIRM: string = "chessPieceMovedConfirm";
    public static SURRENDER_GAME_CONFIRM: string = "surrenderGameConfirm";
}
