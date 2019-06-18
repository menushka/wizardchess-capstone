const stockfish = require("stockfish");

export class StockfishManager {

    public static instance: StockfishManager;

    public bestmoves: string[] = [];
    public ponders: string[] = [];
    private fish: any;

    constructor() {
        StockfishManager.instance = this;
        this.fish = stockfish();
        this.fish.onmessage = async (event: any) => {
            const analysis = await this.fenAnalysis(event)
            if (analysis) {
                console.log(analysis);
                await this.bestmoves.push(analysis.bestmove.raw)
                await this.ponders.push(analysis.ponder.raw)
            }
        }
    }

    public fenAnalysis(fen: string) {
        const pattern = /bestmove (\w+)(?: ponder (\w+))?/;
        const re = new RegExp(pattern)

        if (re.test(fen)) {
            const x = re.exec(fen)
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
        console.log(fen);
        this.fish.postMessage(`position fen ${fen}`)
        this.fish.postMessage(`go depth ${depth}`)
    }
}