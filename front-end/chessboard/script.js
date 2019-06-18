var board = null
var $board = $('#myBoard')
var game = new Chess()
var squareToHighlight = null
var squareClass = 'square-55d63'

const socket = io('http://localhost:8000', { query: { client:"frontend" } });

var onevent = socket.onevent;
socket.onevent = function (packet) {
var args = packet.data || [];
onevent.call (this, packet);    // original call
packet.data = ["*"].concat(args);
onevent.call(this, packet);      // additional call to catch-all
};

socket.on("*",function(event,data) {
console.log(event);
console.log(data);
});

function removeHighlights (color) {
  $board.find('.' + squareClass)
    .removeClass('highlight-' + color)
}

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false
}

function makeRandomMove () {
  var possibleMoves = game.moves({
    verbose: true
  })

  // game over
  if (possibleMoves.length === 0) return

  var randomIdx = Math.floor(Math.random() * possibleMoves.length)
  var move = possibleMoves[randomIdx]
  game.move(move.san)

  // highlight black's move
  removeHighlights('black')
  $board.find('.square-' + move.from).addClass('highlight-black')
  squareToHighlight = move.to

  // update the board to the new position
  board.position(game.fen())
}

function stockfishMove () {
    
  // highlight black's move
  removeHighlights('black')
  $board.find('.square-' + move.from).addClass('highlight-black')
  squareToHighlight = move.to

  // update the board to the new position
  board.position(game.fen())
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  // highlight white's move

  console.log(move);

  removeHighlights('white')
  $board.find('.square-' + source).addClass('highlight-white')
  $board.find('.square-' + target).addClass('highlight-white')

  ChessPiece = {
    piece: move.piece,
    colour: move.colour
  }
  
  BoardLocation = {
    from: move.from,
    to: move.to
  }

  socket.emit('chessPieceM1oved', {
    piece: move.piece,
    colour: move.colour,
    location: move.to
  });

  // make random move for black
  window.setTimeout(makeRandomMove, 250)
}

function onMoveEnd () {
  $board.find('.square-' + squareToHighlight)
    .addClass('highlight-black')
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

// function fenAnalysis(event) {
//     var pattern = /bestmove (\w+)(?: ponder (\w+))?/
//     var re = new RegExp(pattern)

//     if (re.test(event)) {
//         x = re.exec(event)
//         res = {
//             bestmove: {
//                 raw: x[1]
//             },
//             ponder: {
//                 raw: x[2]
//             }
//         }
//         return res
//     } else {
//         return null
//     }
// }

// //Input FEN
// function postFen({
//     engine,
//     depth,
//     fen
// } = {}) {
//     engine.postMessage(`position fen ${fen}`)
//     engine.postMessage(`go depth ${depth}`)
// }

// function printGameState(){
//     console.log(
//         `
//         Game Over: ${chess.game_over()}
//         Turn: ${chess.turn()}
//         Checkmate: ${chess.in_checkmate()}
//         Stalemate: ${chess.in_stalemate()}
//         Threefold Repitition: ${chess.in_threefold_repetition()}
//         fen: ${chess.fen()}
//         `
//     );
// }


// fish.onmessage = async event => {

//     analysis = fenAnalysis(event)
//     if (analysis) {
//         // console.log(analysis.bestmove.raw)
//         console.log(analysis);
//         console.log(`next_move: ${analysis.bestmove.raw} | ${chess.turn()}`)
//         chess.move(analysis.bestmove.raw, {
//             sloppy: true
//         })
//         console.log(chess.ascii());
//         printGameState();
//     }
// }

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMoveEnd: onMoveEnd,
  onSnapEnd: onSnapEnd
}

socket.emit('startGame',  { type: 1});

board = Chessboard('board1', config)