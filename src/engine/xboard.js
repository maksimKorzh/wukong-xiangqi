/****************************\
 ============================

         XBOARD MODE

 ============================              
\****************************/

// init engine
const { Engine } = require('./wukong.js');  
const engine = new Engine();

process.stdin.setEncoding('utf-8');

// print options
function printOptions() {
  console.log('feature ping=1 setboard=1 colors=0 usermove=1 memory=1');
  console.log('feature done=1');
}

printOptions();

// settings
var time = -1;// inc = 0;
var engineSide = engine.NO_COLOR;

// prepare to play
engine.setBoard(engine.START_FEN);
time = -1;

// create CLI varerface
var readline = require('readline');
var uci = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// think
function think() {
  engine.resetTimeControl();
  timing = engine.getTimeControl();

  let startTime = Date.now();
  
  if (time != -1) {
    timing.timeSet = 1;  
    timing.stopTime = startTime + (time > 5000 ? time / 30 : time);
    engine.setTimeControl(timing);
    engine.search(64);
	} else engine.search(7);
}

// UCI loop
uci.on('line', function(command){
  if (command == 'quit') process.exit();
  if (command.includes('protover')) printOptions();
  if (command.includes('time')) time = parseInt(command.split(' ')[1]);
  if (command.includes('ping')) console.log(command);
  
  if (command.includes('new')) {
    engine.setBoard(engine.START_FEN);
    time = -1;
  }
  
  if (command.includes('setboard')) {
    try { engine.setBoard(command.split('setboard ')[1]);
    } catch(e) { engine.setBoard(engine.START_FEN); }
  }
  
  if (command == 'go') think();

  if (command.includes('usermove')) {
    let validMove = engine.moveFromString(command.split(' ')[command.split(' ').length - 1]);
    if (validMove) engine.makeMove(validMove);
    engine.resetSearchPly();
    engine.printBoard();
  }
  
  if (command.length == 4) {
    let validMove = engine.moveFromString(command.split(' ')[command.split(' ').length - 1]);
    if (validMove) engine.makeMove(validMove);
    engine.resetSearchPly();
    engine.printBoard();
  }
});

