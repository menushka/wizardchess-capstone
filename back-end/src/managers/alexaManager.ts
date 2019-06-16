import { Events } from "../events";
import { IAlexaConnection, IAlexaJoin, IAlexaMovePiece } from "../interfaces/alexa";

export class AlexaManager {

    private alexaSocket: SocketIO.Socket;
    private alexaPlayers: { [id: string]: string } = {};

    public setSocket(socket: SocketIO.Socket) {
        this.alexaSocket = socket;
        this.attachSocketListeners();
    }

    public getSocket() {
        return this.alexaSocket;
    }

    public addPlayer(userId: string) {
        this.alexaPlayers[userId] = null;
    }

    private attachSocketListeners() {
        this.alexaSocket.on(Events.ALEXA_CONNECTION, (data: IAlexaConnection) => {
            this.alexaPlayers[data.userId] = null;
        });

        this.alexaSocket.on(Events.JOIN_GAME, (data: IAlexaJoin) => {
            this.alexaPlayers[data.userId] = data.gameId;
        });

        this.alexaSocket.on(Events.CHESS_PIECE_MOVED, (data: IAlexaMovePiece) => {

        });
    }
}
