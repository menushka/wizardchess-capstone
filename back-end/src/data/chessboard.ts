import { GameType, IChessBoard } from "../interfaces/general";

export class ChessBoard implements IChessBoard {

    public id: string;
    public type: GameType;
    public state: ChessBoardState;
    public black: string;
    public white: string;
    public boardState: string[][];
    public currentTurn: number;

    constructor(userId: string, type: GameType, gameId: string) {
        this.id = gameId;
        this.type = type;
        this.randomAssignWhiteOrBlack(userId);
        if (this.type === GameType.AI) {
            this.state = ChessBoardState.Playing;
        } else if (this.type === GameType.Player) {
            this.state = ChessBoardState.Waiting;
        }
        this.currentTurn = 0;
        this.setDefaultBoardState();
    }

    public join(userId: string) {
        this.assignRemainder(userId);
    }

    public movePiece() {
        const x = Math.floor(Math.random() * 8);
        const y = Math.floor(Math.random() * 8);
        let nx = Math.floor(Math.random() * 8);
        let ny = Math.floor(Math.random() * 8);
        while (true) {
            if (x !== nx && y !== ny) {
                break;
            } else {
                nx = Math.floor(Math.random() * 8);
                ny = Math.floor(Math.random() * 8);
            }
        }
        this.boardState[ny][nx] = this.boardState[y][x];
        this.boardState[y][x] = "";
    }

    public surrender(userId: string) {
        this.state = ChessBoardState.Finished;
    }

    private randomAssignWhiteOrBlack(userId: string) {
        if (Math.random() > 0.5) {
            this.white = userId;
        } else {
            this.black = userId;
        }
    }

    private assignRemainder(userId: string) {
        if (this.white) {
            this.black = userId;
        } else if (this.black) {
            this.white = userId;
        }
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
    }
}

enum ChessBoardState {
    Waiting, Playing, Finished
}
