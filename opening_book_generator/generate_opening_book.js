// work with file system
const fs = require("fs")

// init engine
const XiangqiPGNparser = require('./xiangqi_pgn_parser').XiangqiPGNparser;
const parser = new XiangqiPGNparser();

// convert game to UCI format
let pgn = fs.readFileSync('bulk_games.pgn').toString();
let games = pgn.split('\n\n');
let openingLines = '';
let gameNumber = 0;
let gameLimit = 1000;

// loop over games
for (let count = 0; count < games.length; count++) {
  let game = games[count];
  var headers;
  
  if (games[count][0] == '[') {
    // split headers
    headers = games[count];
  } else if (games[count][0] == '1') {
    // filter by player (optional)
    //if (headers.includes('LIU DaHua') == false) continue;
    //if (headers.includes('HU RongHua') == false) continue;
  
    // convert game to UCI format
    let moveList = games[count];
    let moves = moveList.split(' ');
    let uciMoves = parser.gameToUCI(moves);
    
    // skip malformed games (optional)
    if (uciMoves.includes('xxxx')) continue;
    
    // info
    gameNumber++;
    console.log('Converting game', gameNumber, 'out of', (games.length / 2) << 0, 'games');

    // append to output PGN
    openingLines += "'" + uciMoves.join(' ') + "',\n";
  }
}

    
// bulk write games
fs.writeFileSync('opening_book.txt', openingLines);








