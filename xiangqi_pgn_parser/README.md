# Xiangqi games PGN parser
Utility to convert PGN files with move international move format like "Ｃ２＝５ Ｈ８＋７"<br>
to "h2e2 h9g7" UCI/UCCI/ICCS format readable by UCI/UCCI engines and Xboard/Winboard GUI

# Parse single game PGN
```js
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
```

# Parse multi games PGN
```js
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
  } else if (games[count][0] == '1') {
    // filter by player (optional)
    //if (headers.includes('LIU DaHua') == false) continue;
    //if (headers.includes('HU RongHua') == false) continue;
  
    // convert game to UCI format
    let moveList = games[count];
    let moves = moveList.split(' ');
    let uciMoves = parser.gameToUCI(moves);
    let moveListUCI = '';
    
    // skip malformed games (optional)
    if (uciMoves.includes('xxxx')) continue;
    
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
```

# Tests
It successfully converted 40711 of 42228 games from international to<br>
UCI/UCCI/ICCS format. The rest 1517 are parsed partially and are not included<br>
into the eventual dataset. The issue seems to be within the malformed moves obtained<br>
during web scraping/decoding phase, so it doesn't have to be the issue of the parser.

# Limitation
Parser doesn't recognize more than 2 pawns on the single file, but there wasn't a single<br>
game with that like positions within 42228 of available games that were used for testing







