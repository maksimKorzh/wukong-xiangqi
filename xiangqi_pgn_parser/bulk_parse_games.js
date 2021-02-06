// work with file system
const fs = require("fs")

// init engine
const XiangqiPGNparser = require('./xiangqi_pgn_parser').XiangqiPGNparser;
const parser = new XiangqiPGNparser();

// convert game to UCI format
let pgn = fs.readFileSync('bulk_games.pgn').toString();
let games = pgn.split('\n\n');
let uciGames = '';
let gameNumber = 0;
let gameLimit = 1000;

// loop over games
for (let count = 0; count < games.length; count++) {
  let game = games[count];
  var headers;
  
  if (games[count][0] == '[') {
    // split headers
    headers = games[count];
    
    // filter by player (optional)
    if (headers.includes('LIU DaHua') == false) continue;
    
  } else if (games[count][0] == '1') {
    // convert game to UCI format
    let moveList = games[count];
    let moves = moveList.split(' ');
    let uciMoves = parser.gameToUCI(moves);
    let moveListUCI = '';
    
    // info
    gameNumber++;
    console.log('Converting game', gameNumber, 'out of', (games.length / 2) << 0, 'games');

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
    
    // limit games
    //if (gameNumber == gameLimit) break;
  }
}

// bulk write games
fs.writeFileSync('bulk_games_uci.pgn', uciGames);








