import { BoardLocation, ChessPiece, GameType, IChessBoard } from "../interfaces/general";
import { AlexaManager } from "../managers/alexaManager";
import { PlayerManager } from "../managers/playerManager";
import { StockfishManager } from "../managers/stockfishManager";

import * as chessjs from "chess.js";
const stockfish = require("stockfish");

export class ChessBoard implements IChessBoard {

    public id: string;
    public type: GameType;
    public state: ChessBoardState;
    public blackUser: string;
    public whiteUser: string;
    public boardState: string[][];
    public currentTurn: number;
    public Chess: any;
    public fen: string;
    
    private pastfen: string;

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

    public async movePiece(userId: string, piece: ChessPiece, location: BoardLocation) {
        if (this.getCurrentUser() !== userId) { return; }

        if (piece !== "P") {
            this.Chess.move(piece + location);
        } else {
            this.Chess.move(location);
        }

        setTimeout(() => {
            this.fen = this.Chess.fen();
        }, 50);

        setTimeout(() => {
            const test = StockfishManager.instance.postFen(2, this.Chess.fen());
        }, 333);
        setTimeout( () => {
            const move = this.Chess.move(StockfishManager.instance.bestmoves.slice(-1)[0], {sloppy: true});
            console.log(this.Chess.ascii());
            console.log(this.Chess.fen());
            this.fen = this.Chess.fen();
            return true;
        }, 666);
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
        }
        return true;
    }

    private getCurrentUser() {
        return this.currentTurn % 2 === 0 ? this.whiteUser : this.blackUser;
    }

    private setDefaultBoardState() {
        this.boardState = [
            ["B2", "B3", "B4", "B5", "B6", "B4", "B3", "B2"],
            ["B1", "B1", "B1", "B1", "B1", "B1", "B1", "B1"],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["W1", "W1", "W1", "W1", "W1", "W1", "W1", "W1"],
            ["W2", "W3", "W4", "W5", "W6", "W4", "W3", "W2"]
        ];
        this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    }
}

enum ChessBoardState {
    Waiting, Playing, Finished
}
