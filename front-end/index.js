var Chess = require('chess.js').Chess;
var stockfish = require('stockfish');

// CPU vs CPU test cases

// Parse return from Stockfish API 
function fenAnalysis(event) {
    var pattern = /bestmove (\w+)(?: ponder (\w+))?/
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

//Input FEN
function postFen({
    engine,
    depth,
    fen
} = {}) {
    engine.postMessage(`position fen ${fen}`)
    engine.postMessage(`go depth ${depth}`)
}

function printGameState(){
    console.log(
        `
        Game Over: ${chess.game_over()}
        Turn: ${chess.turn()}
        Checkmate: ${chess.in_checkmate()}
        Stalemate: ${chess.in_stalemate()}
        Threefold Repitition: ${chess.in_threefold_repetition()}
        fen: ${chess.fen()}
        `
    );
}

function randomIntFromInterval(min,max) // min and max included
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

var fish = stockfish()
var chess = new Chess();

fish.onmessage = async event => {

    analysis = fenAnalysis(event)
    if (analysis) {
        console.log(event);
        // console.log(analysis.bestmove.raw)
        // console.log(analysis);
        // console.log(`next_move: ${analysis.bestmove.raw} | ${chess.turn()}`)
        chess.move(analysis.bestmove.raw, {
            sloppy: true
        })
        console.log(chess.ascii());
        printGameState();
    }
}

counter = 0 

var gameStart = setInterval(() => {
    if (!chess.game_over()) {
        postFen({
            engine: fish,
            depth: randomIntFromInterval(1,2),
            fen: chess.fen()
        })
        counter++;
    } else {
        console.log(`---- End ----`);
        chess.game_over();
        printGameState();
        clearInterval(gameStart);
    }
}, 50);


