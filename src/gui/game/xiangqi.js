/****************************\
 ============================

         INIT ENGINE

 ============================              
\****************************/

// init engine
var engine = new Engine();

// run in browser mode  
console.log('\n  Wukong JS - BROWSER MODE - v' + engine.VERSION);
console.log('  type "engine" for public API reference');


/****************************\
 ============================

           GLOBALS

 ============================              
\****************************/


var book = [];
var botName = ''


/****************************\
 ============================

        XIANGQI BOARD

 ============================              
\****************************/

// piece folder
var pieceFolder = 'traditional_pieces';

// import sounds
const MOVE_SOUND = new Audio('game/sounds/move.wav');
const CAPTURE_SOUND = new Audio('game/sounds/capture.wav');

// square size
const CELL_WIDTH = 46;
const CELL_HEIGHT = 46;

// select color
const SELECT_COLOR = 'brown';

// flip board
var flip = 0;

// flip board
function flipBoard() {
  flip ^= 1;
  drawBoard();  
}

// render board in browser
function drawBoard() {
  var chessBoard = '<table cellspacing="0"><tbody>'
  
  // board table
  for (let row = 0; row < 14; row++) {
    chessBoard += '<tr>'
    for (let col = 0; col < 11; col++) {
      let file, rank;
      
      // flip board
      if (flip) {
        file = 11 - 1 - col;
        rank = 14 - 1 - row;
      } else {
        file = col;
        rank = row;
      }
      
      let square = rank * 11 + file;
      let piece = engine.getPiece(square);
      var pieceImage = '<img style="width: 44px" draggable="true"';
      pieceImage += 'src="game/images/' + pieceFolder + '/' + piece + '.svg"></img>';

      if (engine.squareToString(square) != 'xx') {
        chessBoard += 
          '<td align="center" id="' + square + 
          '" width="' + CELL_WIDTH + 'px" height="' + CELL_HEIGHT +  'px" ' +
          ' onclick="tapPiece(this.id)" ' + 
          ' ondragstart="dragPiece(event, this.id)" ' +
          ' ondragover="dragOver(event, this.id)"'+
          ' ondrop="dropPiece(event, this.id)">' + (piece ? pieceImage : '') +
          '</td>';
      }
    }

    chessBoard += '</tr>';
  }

  chessBoard += '</tbody></table>';
  document.getElementById('xiangqiboard').innerHTML = chessBoard;
}

// play sound
function playSound(move) {
  if (engine.getCaptureFlag(move)) CAPTURE_SOUND.play();
  else MOVE_SOUND.play();
}


/****************************\
 ============================

          GAME PLAY

 ============================              
\****************************/

// stats
var guiScore = 0;
var guiDepth = 0;
var guiTime = 0;
var guiPv = '';
var guiSide = 0;
var userTime = 0;
var gameResult = '*';
var guiFen = '';

// difficulty
var fixedTime = 0;
var fixedDepth = 0;

// user input controls
var clickLock = 0;
var allowBook = 1;
var userSource, userTarget;

// 3 fold repetitions
var repetitions = 0;

// set board theme
function setBoardTheme(theme) {
  document.getElementById('xiangqiboard').style.backgroundImage = 'url(' + theme + ')';
}

// set piece theme
function setPieceTheme(theme) {
  pieceFolder = theme;
  drawBoard();
}

// pick piece handler
function dragPiece(event, square) {
  userSource = square;
}

// drag piece handler
function dragOver(event, square) {
  event.preventDefault();
  if (square == userSource) event.target.src = '';
}

// drop piece handler
function dropPiece(event, square) {
  userTarget = square;
  let valid = validateMove(userSource, userTarget);  
  movePiece(userSource, userTarget);
  if (engine.getPiece(userTarget) == 0) valid = 0;
  clickLock = 0;
  
  if (engine.getPiece(square) && valid) {
    userTime = Date.now() - userTime;
    document.getElementById(square).style.backgroundColor = SELECT_COLOR;
    playSound(valid);
    updatePgn();
  }
  
  event.preventDefault();
  if (valid) setTimeout(function() { think(); }, 100);
}

// click event handler
function tapPiece(square) {
  drawBoard();
  
  if (engine.getPiece(square)) 
    document.getElementById(square).style.backgroundColor = SELECT_COLOR;
  
  var clickSquare = parseInt(square, 10)
  
  if(!clickLock && engine.getPiece(clickSquare)) {      
    userSource = clickSquare;
    clickLock ^= 1;
  } else if(clickLock) {      
    userTarget = clickSquare;

    let valid = validateMove(userSource, userTarget);
    movePiece(userSource, userTarget);
    if (engine.getPiece(userTarget) == 0) valid = 0;
    clickLock = 0;
    
    if (engine.getPiece(square) && valid) {
      document.getElementById(square).style.backgroundColor = engine.SELECT_COLOR;
      playSound(valid);
      updatePgn();
    }

    if (valid) setTimeout(function() { think(); }, 1);
  }
}

// engine move
function think() {
  //if (engine.inCheck(guiSide)) return;
  
  engine.resetTimeControl();

  let timing = engine.getTimeControl();
  let startTime = new Date().getTime();
  
  //if (fixedTime) {
    fixedDepth = 64;
    timing.timeSet = 1;
    timing.time = 1000;//fixedTime * 1000;
    timing.stopTime = startTime + timing.time
    engine.setTimeControl(timing);
  //}
  
  //let bookMoveFlag = 0;
  let delayMove = 0;
  /*let bestMove = getBookMove();
  
  if (bestMove) {
    bookMoveFlag = 1;
    delayMove = 1000;
  }*/

  //else if (bestMove == 0) bestMove = engine.search(fixedDepth);
  
  bestMove = engine.search(64);
  
  let sourceSquare = engine.getSourceSquare(bestMove);
  let targetSquare = engine.getTargetSquare(bestMove);

  if (engine.isRepetition()) repetitions++;
  if (repetitions == 3) {
    gameResult = '3 fold repetition ' + (engine.getSide() ? 'black' : 'red') + ' lost';
    updatePgn();
    return;
  } else if (engine.getSixty() >= 120) {
    gameResult = '1/2-1/2 Draw by 60 rule move';
    updatePgn();
    return;
  }/* else if (engine.isMaterialDraw()) {
    gameResult = '1/2-1/2 Draw by insufficient material';
    updatePgn();
    return;
  }*//* else if (engine.generateLegalMoves().length == 0 && engine.inCheck()) {
    gameResult = engine.getSide() == 0 ? '0-1 Mate' : '1-0 Mate';
    //updatePgn();

    return;
  } else if (guiScore == 'M1') {
    gameResult = engine.getSide() == 0 ? '1-0 Mate' : '0-1 Mate';
  } else if (engine.generateLegalMoves().length == 0 && engine.inCheck() == 0) {
    gameResult = 'Stalemate';

    //updatePgn();
    return;
  }*/

  //setTimeout(function() {
    movePiece(sourceSquare, targetSquare);
    drawBoard();
 
    if (engine.getPiece(targetSquare)) {
      //document.getElementById(targetSquare).style.backgroundColor = SELECT_COLOR;             
      playSound(bestMove);
      updatePgn();
      userTime = Date.now();
    }
  
  //}, 0);
  
  // delayMove + (guiTime < 100 && delayMove == 0) ? 1000 : ((guiDepth == 0) ? 500 : 100)
}

// move piece in GUI
function movePiece(userSource, userTarget) {
  let moveString = engine.squareToString(userSource) +
                   engine.squareToString(userTarget);

  engine.loadMoves(moveString);
  drawBoard();
}

// take move back
function undo() {
  gameResult = '*';
  engine.takeBack();
  drawBoard();
}

// validate move
function validateMove(userSource, userTarget) {
  let moveString = engine.squareToString(userSource) + 
                   engine.squareToString(userTarget);

  let move = engine.moveFromString(moveString);
  return move;
}


/****************************\
 ============================

             PGN

 ============================              
\****************************/

// get pgn
function getGamePgn() {
  let moveStack = engine.moveStack();
  let pgn = '';

  for (let index = 0; index < moveStack.length; index++) {
    let move = moveStack[index].move;
    let moveScore = moveStack[index].score;
    let moveDepth = moveStack[index].depth;
    let moveTime = moveStack[index].time;
    let movePv = moveStack[index].pv;
    let moveString = engine.moveToString(move);
    let moveNumber = ((index % 2) ? '': ((index / 2 + 1) + '. '));
    let displayScore = (((moveScore / 100) == 0) ? '-0.00' : (moveScore / 100)) + '/' + moveDepth + ' ';
    let stats = (movePv ? '(' + movePv.trim() + ')' + ' ': '') + 
                (moveDepth ? ((moveScore > 0) ? ('+' + displayScore) : displayScore): '') +
                Math.round(moveTime / 1000);
    
    let nextMove = moveNumber + moveString + (moveTime ? ' {' + stats + '}' : '');
    
    pgn += nextMove + ' ';
    userTime = 0;      
  }

  return pgn;
}

// update PGN
function updatePgn() {
  let pgn = getGamePgn();
  let gameMoves = document.getElementById('pgn');
  
  gameMoves.value = pgn;
  
  if (gameResult == '1-0 Mate' || gameResult == '0-1 Mate') {
    gameMoves.value += '# ' + gameResult;
  } else if (gameResult != '*') {
    gameMoves.value += ' ' + gameResult;
  }
  
  gameMoves.scrollTop = gameMoves.scrollHeight;
}

// download PGN
function downloadPgn() {
  let userName = prompt('Enter your name:', 'Player');
  let userColor = (guiSide == 0) ? 'White' : 'Black';
  
  if (userColor != 'White' && userColor != 'Black') {
    alert('Wrong color, please try again');
    return;
  }

  let header = '';
  if (guiFen) header += '[FEN "' + guiFen + '"]\n';
  header += '[Event "Friendly chess game"]\n';
  header += '[Site "https://maksimkorzh.github.io/wukongJS/wukong.html"]\n';
  header += '[Date "' + new Date() + '"]\n';
  header += '[White "' + ((userColor == 'White') ? userName : botName) + '"]\n';
  header += '[Black "' + ((userColor == 'Black') ? userName : botName) + '"]\n';
  header += '[Result "' + gameResult + '"]\n\n';

  let downloadLink = document.createElement('a');
  downloadLink.id = 'download';
  downloadLink.download = ((userColor == 'White') ? (userName + '_vs_' + botName + '.pgn') : (botName + '_vs_' + userName + '.pgn'));
  downloadLink.hidden = true;
  downloadLink.href = window.URL.createObjectURL( new Blob([header + getGamePgn() + ((gameResult == '*') ? ' *' : '')], {type: 'text'}));
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
}


/****************************\
 ============================

        GAME CONTROLS

 ============================              
\****************************/

// start new game
function newGame() {
  guiScore = 0;
  guiDepth = 0;
  guiTime = 0;
  guiPv = '';
  gameResult = '';
  userTime = 0;
  allowBook = 1;
  engine.setBoard(engine.START_FEN);
  drawBoard();
  document.getElementById('pgn').value = '';
  repetitions = 0;
}

/****************************\
 ============================

          ON STARTUP

 ============================              
\****************************/

newGame();


