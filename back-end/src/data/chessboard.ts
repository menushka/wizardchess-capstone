import { BoardLocation, ChessColor, ChessPiece, GameType, IChessBoard } from "../interfaces/general";
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
    public move: any;
    public difficulty: number;

    constructor(userId: string, type: GameType, gameId: string) {
        this.id = gameId;
        this.difficulty = 1;
        this.currentTurn = 0;
        this.Chess = new chessjs.Chess();

        this.checkType(type);
        this.setDefaultBoardState();

        this.state = ChessBoardState.Waiting;
        this.randomAssignWhiteOrBlack(userId);
    }

    public join(userId: string): boolean {
        if (this.state === ChessBoardState.Playing) { return false; }
        return this.assignRemainder(userId);
    }

    public movePiece(userId: string, piece: ChessPiece, location: any) {
        // console.log(this.state);
        // console.log("White: " + this.whiteUser);
        // console.log("Black: " + this.blackUser);
        if (this.state !== ChessBoardState.Playing || this.getCurrentUser() !== userId) { return Promise.reject(this.fen); }
        return new Promise( async (resolve, reject) => {
            if (userId !== "AI") {
                this.move = this.Chess.move(location.from + location.to, {sloppy: true});
                this.fen = this.Chess.fen();
            }
            switch (this.type) {
                case GameType.AI: // PvAI
                this.currentTurn += 1;
                await this.stockfishMove(this.difficulty, this.fen);
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

    // First turn AI Movement
    public checkAiFirstMove(type: GameType) {
        return new Promise((resolve, reject) => {
            this.assignRemainder("AI");
            if (this.whiteUser === "AI") {
                this.movePiece(this.whiteUser, null, null).then((res) => {
                    this.currentTurn -= 1;
                    resolve();
                });
            } else {
                reject("AI is not White");
            }
        });
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
        return this.Chess.turn() === "w" ? this.whiteUser : this.blackUser;
    }

    private setDefaultBoardState() {
        this.Chess.reset();
        this.fen = this.Chess.fen();
    }

    private checkType(type: any) {
        if (typeof type === "string" || typeof type === "number") {
            switch (type) {
                case "ai" || 0:
                    this.type = GameType.AI;
                    break;
                case "player" || 1:
                    this.type = GameType.Player;
                    break;
                default:
                    break;
            }
        } else {
            this.type = type;
        }
    }

}

enum ChessBoardState {
    Waiting = "Waiting",
    Playing = "Playing",
    Finished = "Finished"
}
