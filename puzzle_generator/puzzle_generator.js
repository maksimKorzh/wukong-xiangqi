// work with file system
const fs = require("fs");

// init engine
const Engine = require('./wukong').Engine;
const engine = new Engine();

// convert game to UCI format
let games = fs.readFileSync('games.pgn').toString().split('\n\n');

// puzzles
let puzzles = [];

// generate puzzles
function generatePuzzles() {
  for (count = 0; count < games.length; count++) {
    try {
      let game = games[count];
      let description = game.split('EOD\n')[0];
      let moves = game.split('EOD\n')[1];
      
      moves = moves.slice(0, moves.length - 1);
      engine.setBoard(engine.START_FEN);
      engine.loadMoves(moves);
      
      let output = engine.search(8);
      
      if(output[1].includes('mate')) {
        if (engine.inCheck(engine.getSide())) {
          engine.takeBack();
          tookBack = 1;
        }
        
        engine.printBoard();
        let fen = generateFen();
        
        let puzzle = {
          title: output[1].split('info score ')[1]
                          .split(' depth')[0]
                          .replace('-', '')
                          .replace(' ', ' in ')
                          .replace('m', 'M') + ' move(s)',

          description: description,
          fen: fen
        };
        
        puzzles.push(puzzle);
      }
    } catch(e) {}
  }
}

// generate FEN string
function generateFen() {
  let pieces = [0, 'P', 'A', 'B', 'N', 'C', 'R', 'K', 'p', 'a', 'b', 'n', 'c', 'r', 'k'];
  let fen = '';
  
  for (let rank = 0; rank < 14; rank++) {
    let empty = 0;
    
    for (let file = 0; file < 11; file++) {
      let square = rank * 11 + file;

      if (engine.getPiece(square) != 15) {
        let piece = engine.getPiece(square);
        
        if (piece == 0) empty++;
        if (piece) {
          fen += (empty ? empty : '') + pieces[piece];
          empty = 0;
        }
      }
    }
    
    if (empty) fen += empty;
    empty = 0;
    if (rank > 1 && rank < 11) fen += '/'
  }

  fen += ' ' + (engine.getSide() ? 'b' : 'w');
  fen += ' ' + '- - 0 1'
  return fen;
}

// main driver
generatePuzzles();
fs.writeFileSync('puzzles.json', JSON.stringify(puzzles,  null, 2));











