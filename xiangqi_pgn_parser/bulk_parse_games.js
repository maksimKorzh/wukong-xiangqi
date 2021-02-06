// work with file system
const fs = require("fs")

// init engine
const XiangqiPGNparser = require('./xiangqi_pgn_parser').XiangqiPGNparser;
const parser = new XiangqiPGNparser();

// convert game to UCI format
let pgn = fs.readFileSync('bulk_games.pgn').toString();
let games = pgn.split('\n\n');
let uciGames = '';

// loop over games
for (let count = 0; count < games.length; count++) {
  if (games[count][0] == '[') {
    // convert game to UCI format
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

    // append to output PGN
    let uciGame = headers + '\n\n' + moveListUCI + '\n\n';
    uciGames += uciGame;
  }
}

// bulk write games
fs.writeFileSync('bulk_games_uci.pgn', uciGames);








