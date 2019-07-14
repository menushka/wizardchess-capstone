import { BoardLocation, ChessPiece, GameType, IChessBoard, ChessColor } from "../interfaces/general";
import { AlexaManager } from "../managers/alexaManager";
import { PlayerManager } from "../managers/playerManager";
import { StockfishManager } from "../managers/stockfishManager";

import * as chessjs from "chess.js";
import { resolve } from "path";

export class ChessBoard implements IChessBoard {

    public id: string;
    public type: GameType;
    public state: ChessBoardState;
    public blackUser: string;
    public whiteUser: string;
    public currentTurn: number;
    public Chess: any;
    public chessHelper: any;
    public fen: string;

    constructor(userId: string, type: GameType, gameId: string) {
        this.id = gameId;
        this.type = type;
        this.currentTurn = 0;
        this.Chess = new chessjs.Chess();

        this.setDefaultBoardState();

        this.state = ChessBoardState.Waiting;
        this.randomAssignWhiteOrBlack(userId);
        if (this.type === GameType.AI) {
            this.assignRemainder("AI");
        }

        console.log("Game Start (" , this.id, ") --- UserID:" , userId);

        console.log(`Game Start (${this.id}) (${this.whiteUser}) (${this.blackUser})`);
    }

    public join(userId: string): boolean {
        if (this.state === ChessBoardState.Playing) { return false; }
        return this.assignRemainder(userId);
    }

    public movePiece(userId: string, piece: ChessPiece, location: any) {
        if (this.state !== ChessBoardState.Playing || this.getCurrentUser() !== userId) { return Promise.resolve(this.fen); }
        return new Promise( async (resolve, reject) => {
            this.Chess.move(location.from + location.to, {sloppy: true});
            this.fen = this.Chess.fen();
            switch (this.type) {
                case GameType.AI: // PvAI
                this.currentTurn += 1;
                await this.stockfishMove(2, this.fen);
                break;
                case GameType.Player: // PvP
                break;
            }
            this.currentTurn += 1;
            resolve(this.fen);
        });
    }

    public stockfishMove(depth: number, fen: string) {
        return new Promise((resolve, reject) => {
            StockfishManager.instance.postFen(depth, fen);
            setTimeout(() => {
                const move = this.Chess.move(StockfishManager.instance.bestmoves.slice(-1)[0], { sloppy: true });
                // console.log(this.Chess.ascii());
                if (move == null) {
                    if (this.Chess.game_over() === true) {
                        reject("Game Over");
                    }
                    reject("Invalid Move (Parse Failed on Move)");
                } else {
                    this.fen = this.Chess.fen();
                    resolve(this.fen);
                }
            }, 50);
        });
    }

    public moveHelper(depth: number, fen: string) {
        StockfishManager.instance.postFen(depth, fen); // Moves for player
        setTimeout(() => {
            this.chessHelper = {
                from: StockfishManager.instance.bestmoves.slice(-1)[0].substring(0, 2),
                to: StockfishManager.instance.bestmoves.slice(-1)[0].substring(2, 4)
            };
        }, 50);
    }

    public surrender(userId: string) {
        this.state = ChessBoardState.Finished;
        if (this.whiteUser) {
            PlayerManager.instance.clearGame(this.whiteUser);
            AlexaManager.instance.clearGame(this.whiteUser);
        }
        if (this.blackUser) {
            PlayerManager.instance.clearGame(this.blackUser);
            AlexaManager.instance.clearGame(this.blackUser);
        }
    }

    public getUserColor(userId: string): ChessColor | "" {
        if (userId === this.whiteUser) {
            return ChessColor.WHITE;
        } else if (userId === this.blackUser) {
            return ChessColor.BLACK;
        } else {
            return "";
        }
    }

    private randomAssignWhiteOrBlack(userId: string) {
        if (Math.random() > 0.5) {
            this.whiteUser = userId;
        } else {
            this.blackUser = userId;
        }
    }

    private assignRemainder(userId: string) {
        if (this.whiteUser) {
            this.blackUser = userId;
        } else if (this.blackUser) {
            this.whiteUser = userId;
        } else {
            return false;
        }
        this.state = ChessBoardState.Playing;
        return true;
    }

    private getCurrentUser() {
        return this.currentTurn % 2 === 0 ? this.whiteUser : this.blackUser;
    }

    private setDefaultBoardState() {
        this.Chess.reset();
        this.fen = this.Chess.fen();
    }
}

enum ChessBoardState {
    Waiting = "Waiting",
    Playing = "Playing",
    Finished = "Finished"
}
