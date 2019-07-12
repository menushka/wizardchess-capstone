var board = null
var $board = $('#myBoard')
var game = new Chess()
var squareToHighlight = null
var squareClass = 'square-55d63'

var pieces = {
  'p': "P",
  'r': "R",
  'n': "N",
  'b': "B",
  'q': "Q",
  'k': "K",
}

const socket = io('http://localhost:8000', { query: { client:"frontend" } });

var onevent = socket.onevent;
socket.onevent = function (packet) {
var args = packet.data || [];
onevent.call (this, packet);    // original call
packet.data = ["*"].concat(args);
onevent.call(this, packet);      // additional call to catch-all
};

function removeHighlights (color) {
  $board.find('.' + squareClass)
    .removeClass('highlight-' + color)
}

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function stockfishMove () {
  // highlight black's move
  removeHighlights('black')
  $board.find('.square-' + move.from).addClass('highlight-black')
  squareToHighlight = move.to

  // update the board to the new position
  board.position(game.fen())
}

var whiteSquareGrey = '#32CD32'
var blackSquareGrey = '#00FF00'

function greySquare (square) {
  var $square = $('#board1 .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move

  console.log(move);

  if (move === null) return 'snapback'

  // highlight white's move
  removeHighlights('white')
  $board.find('.square-' + source).addClass('highlight-white')
  $board.find('.square-' + target).addClass('highlight-white')

  ChessPiece = {
    piece: move.piece,
    colour: move.color
  }

  BoardLocation = {
    from: move.from,
    to: move.to
  }

  // console.log(move);
  // console.log(pieces[move.piece]);

  socket.emit('chessPieceMoved', {
    piece: pieces[move.piece],
    location: {
      from: move.from,
      to: move.to
    }
    
  });

  // make random move for black
  // window.setTimeout(makeRandomMove, 250)
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

socket.on("startGameConfirm",function(data) {
  console.log(data);
  });
  
socket.on("chessPieceMovedConfirm",function(data) {
  console.log(data);
  game.load(data.fen)
  board.position(data.fen)

  greySquare(data.chessHelper.from)
  greySquare(data.chessHelper.to)
  });