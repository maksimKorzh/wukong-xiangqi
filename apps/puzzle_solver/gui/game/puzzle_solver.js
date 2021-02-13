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
var botName = '';
var currentPuzzleId = '';


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
      pieceImage += 'src="game/images/' + pieceFolder + '/' + piece + '.png"></img>';

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
  //if (document.getElementById('showMoves').checked == false) return;
  
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
var fixedTime = 1;
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
    updatePgn();
  }
  
  event.preventDefault();
  if (valid) setTimeout(function() { think(); }, 100);
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
      updatePgn();
    }

    if (valid) setTimeout(function() { think(); }, 1);
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
  if (repetitions >= 3) {
    gameResult = '3 fold repetition ' + (engine.getSide() ? 'black' : 'red') + ' lost';
    return 1;
  } else if (engine.generateLegalMoves().length == 0) {
    gameResult = (engine.getSide() ? '1-0' : '0-1') + ' mate';
    return 1;
  } else if (engine.getSixty() >= 120) {
    gameResult = '1/2-1/2 Draw by 60 rule move';
    return 1;
  } // TODO: material draw?

  if (engine.generateLegalMoves().length == 0) {
    gameResult = (engine.getSide() ? '1-0' : '0-1') + ' mate';
    return 1;
  }
  
  return 0;
}

// engine move
function think() {
  if (isGameOver()) {
    updatePgn();
    
    // load next position
    setTimeout(function() {
      currentPuzzleId++;
      if (currentPuzzleId >= Puzzles.length) currentPuzzleId = 0;
      setPuzzle('puzzle_' + currentPuzzleId);  
      return;
    }, 5000);
  }
  
  //if (document.getElementById('editMode').checked == true) return;
  engine.resetTimeControl();

  let timing = engine.getTimeControl();
  let startTime = new Date().getTime();
  
  if (fixedTime) {
    fixedDepth = 64;
    timing.timeSet = 1;
    timing.time = fixedTime * 1000;
    timing.stopTime = startTime + timing.time
    engine.setTimeControl(timing);
  }
  
  let bookMoveFlag = 0;
  let delayMove = 0;
  let bestMove = getBookMove();

  if (botName == 'Baihua') {
    let moves = engine.generateLegalMoves();
    try { bestMove = moves[Math.floor(Math.random() * moves.length)].move;
    } catch(e) {}
  } else {
    if (bestMove) bookMoveFlag = 1;
    else if (bestMove == 0) bestMove = engine.search(fixedDepth);
  }
  
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
      updatePgn();
      
      // reload current position
      if (engine.generateLegalMoves().length == 0) {
        setTimeout(function() {
          setPuzzle('puzzle_' + currentPuzzleId);
          console.log('here')
        }, 1000);
      }

      userTime = Date.now();
    }
  
  }, delayMove);
}

// move piece in GUI
function movePiece(userSource, userTarget) {
  let moveString = engine.squareToString(userSource) +
                   engine.squareToString(userTarget);

  if (isGameOver() == 0) engine.loadMoves(moveString);
  else updatePgn();
  drawBoard();
}

// take move back
function undo() {
  gameResult = '*';
  try {
    engine.takeBack();
    drawBoard();
  } catch(e) {}
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
  let userName = prompt('Enter your name:', 'Player');
  if (userName == null) return;
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
  header += '[Variant "xiangqi"]\n';
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

/* init puzzles
function initPuzzles() {
  for (let index = 0; index < Puzzles.length; index++) {
    let id = Puzzles[index].id;
    let title = Puzzles[index].title;
    let fen = Puzzles[index].title;
    
    let puzzle = `
      <li class="list-group-item-action mb-1">
        <button class="btn col-9 text-left" onclick="setPuzzle('` + id + `');">`
           + title +
        `</button>
      </li>
    `

    document.getElementById('puzzles').innerHTML += puzzle;
  }
}*/

// set puzzle
function setPuzzle(puzzleId) {
  flip = 0;
  guiScore = 0;
  guiDepth = 0;
  guiTime = 0;
  guiPv = '';
  gameResult = '';
  userTime = 0;
  allowBook = 1;
  
  let puzzle;
  if (puzzleId) {
    currentPuzzleId = parseInt(puzzleId.split('_')[1]);
    puzzle = Puzzles[currentPuzzleId];
    engine.setBoard(puzzle.fen);
    document.getElementById('pgn').value = 'puzzle #' + (currentPuzzleId + 1) + ': ' + puzzle.title + '\n' + puzzle.description;
  } else {
    let fen = document.getElementById('fen').value;
    engine.setBoard(fen);
    document.getElementById('pgn').value = 'Custom puzzle';
  }
  
  if (engine.getSide() == engine.COLOR['BLACK']) flipBoard();
  drawBoard();
  repetitions = 0;
}


/****************************\
 ============================

          ON STARTUP

 ============================              
\****************************/

// add puzzle to list
function addPuzzle(count) {
  let puzzle = Puzzles[count];
  let puzzleItem = document.createElement('li');
  puzzleItem.id = 'puzzle_' + count;
  puzzleItem.classList.add('list-group-item-action');
  puzzleItem.classList.add('btn');
  puzzleItem.textContent = (count + 1) + '. ' + puzzle['title'];
  puzzleItem.setAttribute('onclick', 'setPuzzle(this.id)');
  puzzles.appendChild(puzzleItem);
}

// init game list
(function initPuzzles() {
  let puzzles = document.getElementById('puzzles');
  for (let count = 0; count < Puzzles.length; count++) addPuzzle(count);
}());

setPuzzle('puzzle_0');


