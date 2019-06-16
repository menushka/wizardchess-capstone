export class Events {
    // INCOMING EVENTS
    public static CONNECTION: string = "connection";
    public static ALEXA_CONNECTION: string = "alexaConnection";

    public static JOIN_GAME: string = "joinGame";
    public static CHESS_PIECE_MOVED: string = "chessPieceMoved";

    // OUTGOING EVENTS
    public static BOARD_UPDATE_STATUS: string = "boardStateUpdate";
}
