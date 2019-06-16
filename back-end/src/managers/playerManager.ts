import { Events } from "../events";

export class PlayerManager {

    private playerSockets: { [id: string]: SocketIO.Socket }  = {};
    private playerGames: { [id: string]: number }  = {};

    public addPlayer(socket: SocketIO.Socket) {
        this.playerSockets[socket.id] = socket;
        this.playerGames[socket.id] = null;
        this.attachSocketListeners(socket.id);
    }

    private attachSocketListeners(socketId: string) {
        this.playerSockets[socketId].on(Events.CHESS_PIECE_MOVED, (socket: SocketIO.Socket) => {
            console.log(socket);
        });
    }
}
