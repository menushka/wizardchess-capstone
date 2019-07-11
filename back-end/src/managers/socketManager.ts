export class SocketManager {

    public static instance: SocketManager;

    private playerSockets: { [id: string]: SocketIO.Socket }  = {};

    private alexaSocket: SocketIO.Socket;

    constructor() {
        SocketManager.instance = this;
    }

    public addUser(socket: SocketIO.Socket) {
        this.playerSockets[socket.id] = socket;
    }

    public addAlexaSocket(socket: SocketIO.Socket) {
        this.alexaSocket = socket;
    }

    public send(userIds: string[], eventName: string, data: any) {
        for (const userId of userIds) {
            if (userId in this.playerSockets) {
                console.log(userId);
                this.playerSockets[userId].emit(eventName, data);
            } else {
                data.userId = userId;
                if (this.alexaSocket) {
                    this.alexaSocket.emit(eventName, data);
                }
            }
        }
    }
}