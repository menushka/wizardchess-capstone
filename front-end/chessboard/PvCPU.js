var board = null
var currentState
var currentColor
var $board = $('#myBoard')
var game = new Chess()
var squareToHighlight = null
var squareClass = 'square-55d63'
var aiToggle = 0
var aiFrom = null
var aiTo = null

var pieces = {
  'p': "P",
  'r': "R",
  'n': "N",
  'b': "B",
  'q': "Q",
  'k': "K",
}

const socket = io('http://' + location.host, {
  query: {
    client: "frontend"
  }
});

function removeHighlights(color) {
  $board.find('.' + squareClass)
    .removeClass('highlight-' + color)
}

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  if (currentState !== "Playing") return false

  // only allowed to move if its currently your turn
  if (currentColor.toLowerCase() !== game.turn()) {
    return false;
  }

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function stockfishMove() {
  // highlight black's move
  removeHighlights('black')
  $board.find('.square-' + move.from).addClass('highlight-black')
  squareToHighlight = move.to

  // update the board to the new position
  board.position(game.fen())
}

var whiteSquareGrey = '#32CD32'
var blackSquareGrey = '#00FF00'

function removeGreySquares () {
  $('#board1 .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square = $('#board1 .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onDrop(source, target) {
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

  moveData = {
    piece: pieces[move.piece],
    location: {
      from: move.from,
      to: move.to
    }
  }

  socket.emit('chessPieceMove', moveData);
}

function onMoveEnd() {
  $board.find('.square-' + squareToHighlight)
    .addClass('highlight-black')
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen())
}

function send(event, data) {
  console.log(event, data);
  socket.emit(event, data);
}

function toggleScreen(screen) {
  if (screen === 0) {
    $('#menuScreen').addClass('hidden');
    $('#gameScreen').removeClass('hidden');
  } else {
    $('#menuScreen').removeClass('hidden');
    $('#gameScreen').addClass('hidden');
  }
}

function startPVAI() {
  toggleScreen(0);
  send("startGame", {
    type: 0
  });
}

function startPVP() {
  toggleScreen(0);
  send("startGame", {
    type: 1
  });
}

function joinPVP() {
  toggleScreen(0);
  send("joinGame", {
    gameId: document.getElementById("joinPVPGameID").value
  });
}

function moveChessPiece() {
  send("chessPieceMove", {
    piece: document.getElementById("gameMovePiece").value,
    location: {
      from: document.getElementById("gameMoveFrom").value,
      to: document.getElementById("gameMoveTo").value
    }
  });
}

function surrender() {
  send("surrenderGame", {
    gameId: document.getElementById("joinPVPGameID").value
  });
}

function getBoardConfig(color) {
  console.log(color);
  console.log(color ==='B' ? 'black' : 'white');
  return {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMoveEnd: onMoveEnd,
    onSnapEnd: onSnapEnd,
    orientation: color ==='B' ? 'black' : 'white'
  }
}

function toggle() {
  if (aiToggle === 1) {
    document.getElementById("aiToggle").innerHTML = "Helper (OFF)";
    document.getElementById("helperText").innerHTML = "&nbsp";
    $('#aiToggle').removeClass('bg-blue-500')
    $('#aiToggle').addClass('bg-white')
    toggleOff();
  } else {
    document.getElementById("aiToggle").innerHTML = "Helper  (ON)";
    $('#aiToggle').removeClass('bg-white')
    $('#aiToggle').addClass('bg-blue-500')
    if (aiTo === null){
      document.getElementById("helperText").innerHTML = "Unable to recommend a move. Try moving a piece";
    } else {
      document.getElementById("helperText").innerHTML = "Recommended Move: " + aiFrom + aiTo;
    }
    toggleOn();
  }
}

function toggleOn() {
  greySquare(aiFrom);
  greySquare(aiTo);
  aiToggle = 1
}

function toggleOff() {
  removeGreySquares()
  aiToggle = 0;
}

// board = Chessboard('board1', getBoardConfig('W'));

socket.on("connectionConfirm", function (data) {
  console.log("connectionConfirm", data);
  document.getElementById("main").style.visibility = "visible";
});

socket.on("startGameConfirm", function (data) {
  console.log("startGameConfirm", data);
  document.getElementById("gameGameID").innerHTML = data.gameId;
  document.getElementById("gameGameURL").innerHTML = 'http://' + location.host + '/game/' + data.gameId;
  document.getElementById("gameGameURL").setAttribute('href', 'http://' + location.host + '/game/' + data.gameId);
  document.getElementById("gameStatus").innerHTML = data.status;
  currentState = data.status;
  currentColor = data.color

  board = Chessboard('board1', getBoardConfig(currentColor));
  game.load(data.board);
  board.position(data.board);
  // clear board ---- new Game
});

socket.on("joinGameConfirm", function (data) {
  console.log("joinGameConfirm", data);
  document.getElementById("gameGameID").innerHTML = data.gameId;
  document.getElementById("gameGameURL").innerHTML = 'http://' + location.host + '/game/' + data.gameId;
  document.getElementById("gameGameURL").setAttribute('href', 'http://' + location.host + '/game/' + data.gameId);
  document.getElementById("gameStatus").innerHTML = data.status;
  currentState = data.status;
  currentColor = data.color;

  board = Chessboard('board1', getBoardConfig(currentColor));
  game.load(data.board);
  board.position(data.board);
  // load board ---- running Game
});

socket.on("boardStateUpdate", function (data) {
  console.log("boardStateUpdate", data);
  document.getElementById("gameStatus").innerHTML = data.status;
  currentState = data.status;
  
  game.load(data.board);
  board.position(data.board);

  aiFrom = data.chessHelper.from;
  aiTo = data.chessHelper.to;

  if (aiToggle === 1) {
    removeGreySquares();
    greySquare(aiFrom);
    greySquare(aiTo);
    document.getElementById("helperText").innerHTML = "Recommended Move: " + aiFrom + aiTo;
  }
});

console.log(socket.id);