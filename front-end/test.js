var id = 0;
var stockfish = require("stockfish");
var stockfishes = [];

stockfishes[id] = stockfish();

stockfishes[id].onmessage = function (message) {
    console.log("received: " + message);
}

stockfishes[id].postMessage('setoption name Contempt value 30');
stockfishes[id].postMessage('setoption name Skill Level value 20');
stockfishes[id].postMessage('ucinewgame');
stockfishes[id].postMessage('isready');