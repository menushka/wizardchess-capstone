import { BoardLocation, ChessPiece, GameType, IChessBoard } from "../interfaces/general";
import { AlexaManager } from "../managers/alexaManager";
import { PlayerManager } from "../managers/playerManager";
import { StockfishManager } from "../managers/stockfishManager";

import * as chessjs from "chess.js";

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
    }

    public join(userId: string): boolean {
        if (this.state === ChessBoardState.Playing) { return false; }
        return this.assignRemainder(userId);
    }

    public movePiece(userId: string, piece: ChessPiece, location: any) {
        if (this.getCurrentUser() !== userId) { return; }

        const move = this.Chess.move(location.from + location.to, {sloppy: true});
        this.fen = this.Chess.fen();

        StockfishManager.instance.postFen(2, this.fen); // stockfish Move

        setTimeout(() => {
            this.Chess.move(StockfishManager.instance.bestmoves.slice(-1)[0], { sloppy: true }); // stockfish Move
            console.log(this.Chess.ascii());
            this.fen = this.Chess.fen();

            this.chessHelper = this.moveHelper(this.fen);
        }, 500);
    }

    public moveHelper(fen: string) {
        StockfishManager.instance.postFen(5, fen); // Moves for player | fixed depth 5
        this.chessHelper = {
            stockfish: StockfishManager.instance.bestmoves
        };
        return StockfishManager.instance.bestmoves;
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
        this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    }
}

enum ChessBoardState {
    Waiting = "Waiting",
    Playing = "Playing",
    Finished = "Finished"
}
