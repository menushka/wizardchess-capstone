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

    public async startGame(userId: string, type: GameType) {
        return await this.createNewGame(userId, type);
    }

    public joinGame(userId: string, gameId: string, cb: (game: ChessBoard) => void) {
        if (this.games[gameId]) {
            const response = this.games[gameId].join(userId);
            if (response) {
                cb(this.games[gameId]);
            }
        }
    }

    public async moveChessPiece(userId: string, gameId: string, chessPiece: ChessPiece, boardLocation: any) {
        await this.games[gameId].movePiece(userId, chessPiece, boardLocation);
        return this.games[gameId];
    }

    public surrender(gameId: string, userId: string) {
        this.games[gameId].surrender(userId);
        return this.games[gameId];
    }

    private async createNewGame(userId: string, type: GameType): Promise<ChessBoard> {
            const code = this.generateGameID();
            const board = await this.createChessBoard(userId, type, code);
            this.games[code] = board;
            return board;
    }

    private createChessBoard(userId: string, type: number, code: string): Promise<ChessBoard> {
        return new Promise( async (resolve, reject) => {
            const board = new ChessBoard(userId, type, code);
            if (board.type === GameType.AI) {
                // console.log(board.type);
                board.checkAiFirstMove(type).then((result) => {
                    resolve(board);
                }).catch((err) => {
                    resolve(board);
                });
            } else {
                resolve(board);
            }
        });
    }

    private generateGameID(): string {
        let gameCode = Math.floor(1000 + Math.random() * 9000);
        while (String(gameCode) in this.games) {
            gameCode = Math.floor(1000 + Math.random() * 9000);
        }
        return String(gameCode);
    }
}
