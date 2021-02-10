// work with file system
const fs = require("fs");

// init engine
const Engine = require('./wukong').Engine;
const engine = new Engine();

// load games
let games = JSON.parse(fs.readFileSync('puzzles.json').toString());

// verify puzzles
function verifyPuzzles() {
  // loop over games
  for (let count = 0; count < games.length; count++) {
    console.log('\n\n\nProcessing puzzle', count, 'out of', games.length, 'puzzles\n\n\n')
    
    let game = games[count];
    let verifiedPuzzle = solvePuzzle(game.fen);
    
    game.id = 'puzzle_' + count;
    game.title = verifiedPuzzle.title;
    game.fen = verifiedPuzzle.fen;
  }  
}

// solve puzzle
function solvePuzzle(fen) {
  let result = {};
  let moves = [];
  
  engine.setBoard(fen);
  let puzzleSide = engine.getSide()

  let bestMove = engine.search(8)[0];
  
  while (bestMove) {
    engine.makeMove(bestMove);
    moves.push(bestMove);
    bestMove = engine.search(8)[0];
  }
  
  let winningSide = engine.getSide() ^ 1;  
  
  if (puzzleSide == winningSide) {
    console.log('PUZZLE IS OK!');
    result.title = 'Mate in ' + Math.round(moves.length / 2) + ' move(s)';
    result.fen = fen;
  } else {
    console.log('FIXING PUZZLE...');
    console.log(puzzleSide);
    engine.setBoard(fen);
    engine.makeMove(moves[0]);
    result.title = 'Mate in ' + Math.round((moves.length - 1) / 2) + ' move(s)';
    result.fen = generateFen();
  }

  return result;
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
verifyPuzzles();
fs.writeFileSync('puzzles_verified.json', JSON.stringify(games,  null, 2));




