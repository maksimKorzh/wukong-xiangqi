// work with file system
const fs = require("fs")

// init engine
const XiangqiPGNparser = require('./xiangqi_pgn_parser').XiangqiPGNparser;
const parser = new XiangqiPGNparser();

// convert game to UCI format
let pgn = fs.readFileSync('single_game.pgn').toString();
let headers = pgn.split('\n\n')[0];
let moveList = pgn.split('\n\n')[1];
let moves = moveList.split(' ');
let uciMoves = parser.gameToUCI(moves);
let moveListUCI = '';

// append move numbers
let moveNumber = 1;
for (let count = 0; count < uciMoves.length; count++) {
  if (count % 2) moveNumber++;
  let move = uciMoves[count];
  moveListUCI += ((count % 2) == 0 ? moveNumber + '. ' : '') + move + ' ';
}

// write output PGN
let uciGame = headers + '\n\n' + moveListUCI;
let pgnUCI = fs.writeFileSync('game_uci.pgn', uciGame);

