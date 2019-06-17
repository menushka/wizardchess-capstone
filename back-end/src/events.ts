export class Events {
    // INCOMING EVENTS
    public static CONNECTION: string = "connection";
    public static ALEXA_CONNECTION: string = "alexaConnection";

    public static START_GAME: string = "startGame";
    public static JOIN_GAME: string = "joinGame";
    public static CHESS_PIECE_MOVED: string = "chessPieceMoved";
    public static SURRENDER_GAME: string = "surrenderGame";

    // OUTGOING EVENTS
    public static GAME_STARTED: string = "gameStarted";
    public static BOARD_UPDATE_STATUS: string = "boardStateUpdate";
}
