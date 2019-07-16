import { ChessBoard } from "../data/chessboard";
import { BoardLocation, ChessPiece, GameType } from "../interfaces/general";
import { SocketManager } from "./socketManager";

export class GameManager {

    public static instance: GameManager;

    private games: { [id: string]: ChessBoard } = {};

    constructor() {
        GameManager.instance = this;
    }

    public getGame(gameId: string): ChessBoard {
        return this.games[gameId];
    }

    public startGame(userId: string, type: GameType) {
        let x = this.createNewGame(userId, type);
        return x;
    }

    public joinGame(userId: string, gameId: string, cb: (game: ChessBoard) => void) {
        if (this.games[gameId]) {
            const response = this.games[gameId].join(userId);
            if (response) {
                cb(this.games[gameId]);
            }
        }
    }

// tslint:disable-next-line: max-line-length
    public async moveChessPiece(userId: string, gameId: string, chessPiece: ChessPiece, boardLocation: any) {
        await this.games[gameId].movePiece(userId, chessPiece, boardLocation);
        return this.games[gameId];
    }

    public surrender(gameId: string, userId: string) {
        this.games[gameId].surrender(userId);
        return this.games[gameId];
    }

    private createNewGame(userId: string, type: GameType): ChessBoard {
        const code = this.generateGameID();
        const board = new ChessBoard(userId, type, code);
        // console.log(board.Chess.ascii());
        this.games[code] = board;
        return board;
    }

    private generateGameID(): string {
        let gameCode = Math.floor(1000 + Math.random() * 9000);
        while (String(gameCode) in this.games) {
            gameCode = Math.floor(1000 + Math.random() * 9000);
        }
        return String(gameCode);
    }
}
