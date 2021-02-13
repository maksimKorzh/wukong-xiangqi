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

var moveStack = {count: 0, moves: []};
var currentGameId = 0;

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
  let isCCBridge = document.getElementById('xiangqiboard').style.backgroundImage.includes('ccbridge');
  
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
      pieceImage += 'src="game/images/' + pieceFolder + '/' + piece + (isCCBridge ? '.png' : '.svg') + '"></img>';

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

// highlight legal moves
function highlightMoves(square) {  
  if (document.getElementById('showMoves').checked == false) return;
  
  let legalMoves = engine.generateLegalMoves();
  
  for (let count = 0; count < legalMoves.length; count++) {
    let move = legalMoves[count].move;
    let sourceSquare = engine.getSourceSquare(move);
    let targetSquare = engine.getTargetSquare(move);
    if (square == sourceSquare) {
      let parent = document.getElementById(targetSquare);
      parent.style.backgroundImage = 'url("game/images/misc/legal_move.png")';
      parent.style.opacity = '0.50';
      if (parent.childNodes.length) {
        parent.childNodes[0].style.opacity = '0.5';
        parent.style.opacity = '1';
        parent.style.backgroundImage = 'url("game/images/misc/legal_capture.png")';
      }
    }
  }
}

// set board theme
function setBoardTheme(theme) {
  document.getElementById('xiangqiboard').style.backgroundImage = 'url(' + theme + ')';
  drawBoard();
}

// set piece theme
function setPieceTheme(theme) {
  pieceFolder = theme;
  drawBoard();
}

// play sound
function playSound(move) {
  if (engine.getCaptureFlag(move)) CAPTURE_SOUND.play();
  else MOVE_SOUND.play();
}


/****************************\
 ============================

          USER INPUT

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

// pick piece handler
function dragPiece(event, square) {
  userSource = square;
  highlightMoves(square);
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
  }
  
  event.preventDefault();
}

// click event handler
function tapPiece(square) {
  drawBoard();
  
  if (engine.getPiece(square)) {
    document.getElementById(square).style.backgroundColor = SELECT_COLOR;
    highlightMoves(square);
  }
  
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
      document.getElementById(square).style.backgroundColor = SELECT_COLOR;
      playSound(valid);
    }
  }
}


/****************************\
 ============================

        ENGINE MOVES

 ============================              
\****************************/

// use opening book
function getBookMove() {
  if (allowBook == 0) return 0;

  let moves = engine.getMoves();
  let lines = [];
  
  if (moves.length == 0) {
    let randomLine = book[Math.floor(Math.random() * book.length)];
    let firstMove = randomLine.split(' ')[0];
    return engine.moveFromString(firstMove);
  } else if (moves.length) {
    for (let line = 0; line < book.length; line++) {
      let currentLine = moves.join(' ');

      if (book[line].includes(currentLine) && book[line].split(currentLine)[0] == '')
        lines.push(book[line]);
    }
  }
  
  if (lines.length) {
    let currentLine = moves.join(' ');
    let randomLine = lines[Math.floor(Math.random() * lines.length)];

    try {
      let bookMove = randomLine.split(currentLine)[1].split(' ')[1];
      return engine.moveFromString(bookMove);
    } catch(e) { return 0; }
  }

  return 0;
}

// check for game state
function isGameOver() {
  if (engine.isRepetition()) repetitions++;
  if (engine.generateLegalMoves().length == 0) {
    gameResult = (engine.getSide() ? '1-0' : '0-1') + ' mate';
    return 1;
  }

  if (engine.generateLegalMoves().length == 0) {
    gameResult = (engine.getSide() ? '1-0' : '0-1') + ' mate';
    return 1;
  }
  
  return 0;
}

// engine move
function think() {
  let timing = engine.getTimeControl();
  let startTime = new Date().getTime();

  fixedDepth = 64;
  timing.timeSet = 1;
  timing.time = 1000;
  timing.stopTime = startTime + timing.time
  engine.setTimeControl(timing);
  
  let bookMoveFlag = 0;
  let delayMove = 0;
  
  bestMove = engine.search(fixedDepth);
  
  if (bestMove == 0) return;
  if (bookMoveFlag || fixedDepth || typeof(guiScore) == 'string') delayMove = 1000;
  
  let sourceSquare = engine.getSourceSquare(bestMove);
  let targetSquare = engine.getTargetSquare(bestMove);

  setTimeout(function() {
    movePiece(sourceSquare, targetSquare);
    drawBoard();
 
    if (engine.getPiece(targetSquare)) {
      document.getElementById(targetSquare).style.backgroundColor = SELECT_COLOR;             
      playSound(bestMove);
      userTime = Date.now();
      
    }
  
  }, 0);
}

// move piece in GUI
function movePiece(userSource, userTarget) {
  let moveString = engine.squareToString(userSource) +
                   engine.squareToString(userTarget);

  if (isGameOver() == 0) engine.loadMoves(moveString);
  drawBoard();
}

// update board
function updateBoard() {
  engine.setPosition(JSON.parse(moveStack.moves[moveStack.count].position));
  engine.setSide(moveStack.moves[moveStack.count].side);
  engine.setSixty(moveStack.moves[moveStack.count].sixty);
  engine.setHashKey(moveStack.moves[moveStack.count].hashKey);
  engine.setKingSquare(JSON.parse(moveStack.moves[moveStack.count].kingSquare));
  drawBoard();
  let move = moveStack.moves[moveStack.count].move;
  let targetSquare = engine.getTargetSquare(move);
  
  if (engine.getPiece(targetSquare) && moveStack.count > 0 && moveStack.count < moveStack.moves.length - 1) {
    document.getElementById(targetSquare).style.backgroundColor = SELECT_COLOR;
    playSound(move);
  }
}

// show first move of the game
function firstMove() {
  moveStack.count = 0;
  updateBoard();
}

// take move back
function previousMove() {
  if (moveStack.count > 0) moveStack.count--;
  updateBoard();
}

// make next move
function nextMove() {
  if (moveStack.count < moveStack.moves.length - 1) moveStack.count++;
  updateBoard();
}

// show last move of the game
function lastMove() {
  moveStack.count = moveStack.moves.length - 1;
  updateBoard();
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
    
    if (displayScore.toString().includes('NaN') && moveScore.includes('M'))
      displayScore = moveScore.replace('M', 'mate in ') + ' # ';
    
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
  let header = '';
  if (guiFen) header += '[FEN "' + guiFen + '"]\n';
  header += '[Event "' + Games[currentGameId].event + '"]\n';
  header += '[Site "https://maksimkorzh.github.io/wukong-xiangqi/apps/game_viewer/gui/game_viewer.html"]\n';
  header += '[Red "' + Games[currentGameId].red + '"]\n';
  header += '[Black "' + Games[currentGameId].black + '"]\n\n';

  let downloadLink = document.createElement('a');
  downloadLink.id = 'download';
  downloadLink.download =  Games[currentGameId].red + '_vs_' + Games[currentGameId].black + '.pgn';
  downloadLink.hidden = true;
  downloadLink.href = window.URL.createObjectURL( new Blob([header + getGamePgn()], {type: 'text'}));
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
}

// upload PGN
function uploadPgn() {
  let examplePgn = `[Event "Jiafun Cup National Champion 1994"]
[Red "Lv Qin"]
[Black "LIN HongMin"]

1. h2e2 h9g7 2. h0g2 i9h9 3. i0h0 b9c7 4. g3g4 c6c5 5. b0a2 a6a5 6. b2c2 c7b5 7. a0a1 b5a3 8. c2c5 a9a6 9. a1b1 a6d6 10. h0h6 b7d7 11. c5c7 g9e7 12. g2f4 f9e8 13. f4g6 d6d5 14. b1b6 d5b5 15. b6a6 b5c5 16. c7b7 d7c7 17. a6b6 a3c2 18. e3e4 c2e3 19. g0i2 a5a4 20. e4e5 e6e5 21. g6e5 g7f5 22. h6h3 h9g9 23. d0e1 a4a3 24. a2c1 c5c3 25. b6c6 c3c6 26. e5c6 c7c1 27. h3h7 e3c4 28. c6e7 f5e7 29. b7b9 e9f9 30. h7e7 g9g6 31. e7e4 c4d6 32. e4f4 d6f7 33. b9b4 c1c7 34. e2f2 c7e7 35. b4e4 f9f8 36. e4e3 g6c6 37. f4e4`;
  let pgn = document.getElementById('pgn').value;
  
  if (pgn.includes(':')) {
    alert('Paste PGN file below board, see the one below to figure out the proper format:\n\n' + examplePgn);
    return;
  }
  
  try {
    let headers = pgn.split('\n\n')[0];
    let moves = pgn.split('\n\n')[1].split(' ');
    let event = headers.split('Event "')[1].split('"')[0];
    let red = headers.split('Red "')[1].split('"')[0];
    let black = headers.split('Black "')[1].split('"')[0];
    let moveList = '';
    
    for (let count = 0; count < moves.length; count++)
      if (moves[count].length > 3) moveList += moves[count] + ' ';
    
    Games.push({
      id: Games.length + 1,
      event: event,
      red: red,
      black: black,
      moves: moveList
    });
    
    addGame(Games.length - 1);
    newGame(Games.length - 1);
  } catch(e) {}
  
  firstMove();
}


/****************************\
 ============================

        GAME CONTROLS

 ============================              
\****************************/

// start new game
function newGame(id) {
  id = parseInt(id);
  currentGameId = id;
  moveStack = {count: 0, moves: []};
  guiScore = 0;
  guiDepth = 0;
  guiTime = 0;
  guiPv = '';
  gameResult = '';
  userTime = 0;
  allowBook = 1;
  engine.setBoard(engine.START_FEN);
  document.getElementById('pgn').value = '  Red: ' + Games[id].red +
                                         '\nBlack: ' + Games[id].black +
                                         '\nEvent: ' + Games[id].event;
  repetitions = 0;
  moveStack.moves.push({
    'move': 0,
    'position': JSON.stringify(engine.getBoard()),
    'side': engine.getSide(),
    'sixty': engine.getSixty(),
    'hashKey': engine.getHashKey(),
    'kingSquare': JSON.stringify(engine.getKingSquare())
  });
    
  let moves = Games[id].moves.split(' ');
  
  for (let count = 0; count < moves.length; count++) {
    let move = moves[count];
    let encodedMove = engine.moveFromString(move);
    engine.loadMoves(move);
    
    moveStack.moves.push({
      'move': encodedMove, 
      'position': JSON.stringify(engine.getBoard()),
      'side': engine.getSide(),
      'sixty': engine.getSixty(),
      'hashKey': engine.getHashKey(),
      'kingSquare': JSON.stringify(engine.getKingSquare())
    });
    
    moveStack.count++;
  }

  firstMove();
}

/****************************\
 ============================

          ON STARTUP

 ============================              
\****************************/

// add game to list
function addGame(count) {
  let game = Games[count];
  let gameItem = document.createElement('li');
  gameItem.id = count;
  gameItem.classList.add('list-group-item-action');
  gameItem.classList.add('btn');
  gameItem.textContent = game['id'] + '. ' + game['red'] + ' - ' + game['black'];
  gameItem.setAttribute('onclick', 'newGame(this.id)');
  games.appendChild(gameItem);
}

// init game list
(function initGames() {
  let games = document.getElementById('games');
  for (let count = 0; count < Games.length; count++) addGame(count);
}());

newGame(0);

