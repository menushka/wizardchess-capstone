// var id = 0;
// var stockfish = require("stockfish");
// var stockfishes = [];

// stockfishes[id] = stockfish();

// stockfishes[id].onmessage = function (message) {
//     console.log("received: " + message);
// }

// stockfishes[id].postMessage('setoption name Contempt value 30');
// stockfishes[id].postMessage('setoption name Skill Level value 20');
// stockfishes[id].postMessage('ucinewgame');
// stockfishes[id].postMessage('isready');

var chessboard = require('chessboardjs');
var fen = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2'

console.dir(chessboard);