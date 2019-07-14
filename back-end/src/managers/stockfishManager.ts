import { resolve } from "dns";

const stockfish = require("stockfish");

export class StockfishManager {

    public static instance: StockfishManager;

    public bestmoves: string[] = [];
    public ponders: string[] = [];
    public isUpdating: boolean = false;

    private fish: any;
    private fishGames: { [id: string]: any };

    constructor() {
        StockfishManager.instance = this;
        this.fish = stockfish();
        this.fish.onmessage = (event: any) => {
            this.isUpdating = true;
            const analysis = this.fenAnalysis(event);
            if (analysis) {
                // console.log(analysis);
                this.bestmoves.push(analysis.bestmove.raw);
                this.ponders.push(analysis.ponder.raw);
            }
            this.isUpdating = false;
        };
    }

    public fenAnalysis(fen: string) {
        const pattern = /bestmove (\w+)(?: ponder (\w+))?/;
        const re = new RegExp(pattern);

        if (re.test(fen)) {
            const x = re.exec(fen);
            const res = {
                bestmove: {
                    raw: x[1]
                },
                ponder: {
                    raw: x[2]
                }
            };
            return res;
        } else {
            return null;
        }
    }

    public postFen(depth: number, fen: string) {
        // console.log("Analyzing:" + fen);
        this.fish.postMessage(`position fen ${fen}`);
        this.fish.postMessage(`go depth ${depth}`);
    }
}
