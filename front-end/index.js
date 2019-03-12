var Chess = require('chess.js').Chess;
var stockfish = require('stockfish');

function fenAnalysis(event) {
    var pattern = /bestmove (\w+) ponder (\w+)/
    var re = new RegExp(pattern)

    if (re.test(event)) {
        x = re.exec(event)
        res = {
            bestmove: {
                raw: x[1]
            },
            ponder: {
                raw: x[2]
            }
        }
        return res
    } else {
        return null
    }
}

function postFen({
    engine,
    depth,
    fen
} = {}) {
    engine.postMessage(`position fen ${fen}`)
    engine.postMessage(`go depth ${depth}`)
}

var fish = stockfish()
var chess = new Chess();

fish.onmessage = async event => {

    analysis = fenAnalysis(event)
    if (analysis) {
        // console.log(analysis.bestmove.raw)
        chess.move(analysis.bestmove.raw, {
            sloppy: true
        })
        console.log(chess.ascii());
        console.log(`move: ${analysis.bestmove.raw}`)
    }

    // chess.move(res.bestmove.raw, {
    //     sloppy: true
    // })
    // console.log(chess.ascii())
}
counter = 0 
setInterval(() => {
    if (chess.game_over() == false) {
        postFen({
            engine: fish,
            depth: 5,
            fen: chess.fen()
        })
        console.log(chess.pgn());
        console.log(chess.game_over());
    } else {
        console.log(
            `
            Game Over: ${chess.game_over()}
            Turn: ${chess.turn()}
            Checkmate: ${chess.in_checkmate()}
            Stalemate: ${chess.in_stalemate()}
            Threefold Repitition: ${chess.in_threefold_repetition()}
            `
        );
    }
}, 50);