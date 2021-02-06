/************************************************\
 ================================================
 
       PGN parser for Chinese chess Xiangqi
           (Ｃ２＝５ Ｈ８＋７ => h2e2 h9g7)
           
                        by
                        
                 Code Monkey King
 
 ===============================================
\************************************************/

/*
      Notation characters for debugging purposes
    Ｐ Ａ Ｅ Ｈ Ｃ Ｒ Ｋ １ ２ ３ ４ ５ ６ ７ ８ ９  ＋ ＝ －
*/

// PGN parser
var XiangqiPGNparser = function() {
  // init engine
  const Engine = require('./wukong').Engine;
  const engine = new Engine();

  // globals
  var side = 0;   // 0 is Red | 1 is Black

  // map piece char to piece code
  const CHAR_TO_PIECE = {
    'RＰ': 1, 'RＡ': 2, 'RＥ': 3, 'RＨ': 4, 'RＣ': 5, 'RＲ': 6, 'RＫ': 7,
    'BＰ': 8, 'BＡ': 9, 'BＥ': 10, 'BＨ': 11, 'BＣ': 12, 'BＲ': 13, 'BＫ': 14
  };

  // map files
  const FILE = [
    {'１': 9, '２': 8, '３': 7, '４': 6, '５': 5, '６': 4, '７': 3, '８': 2, '９': 1},
    {'１': 1, '２': 2, '３': 3, '４': 4, '５': 5, '６': 6, '７': 7, '８': 8, '９': 9}
  ];

  // map pawn's square order on the same file
  const PAWNS_ON_FILE = {'１': 0, '２': 1, '３': 2, '４': 3, '５': 4};


  // map files to square
  const MAP_FILE = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1,  1,  2,  3,  4,  5,  6,  7,  8,  9, -1,
    -1,  1,  2,  3,  4,  5,  6,  7,  8,  9, -1,
    -1,  1,  2,  3,  4,  5,  6,  7,  8,  9, -1,
    -1,  1,  2,  3,  4,  5,  6,  7,  8,  9, -1,
    -1,  1,  2,  3,  4,  5,  6,  7,  8,  9, -1,
    -1,  1,  2,  3,  4,  5,  6,  7,  8,  9, -1,
    -1,  1,  2,  3,  4,  5,  6,  7,  8,  9, -1,
    -1,  1,  2,  3,  4,  5,  6,  7,  8,  9, -1,
    -1,  1,  2,  3,  4,  5,  6,  7,  8,  9, -1,
    -1,  1,  2,  3,  4,  5,  6,  7,  8,  9, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
  ];

  // map rank to square
  const MAP_RANK = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1,  2,  2,  2,  2,  2,  2,  2,  2,  2, -1,
    -1,  3,  3,  3,  3,  3,  3,  3,  3,  3, -1,
    -1,  4,  4,  4,  4,  4,  4,  4,  4,  4, -1,
    -1,  5,  5,  5,  5,  5,  5,  5,  5,  5, -1,
    -1,  6,  6,  6,  6,  6,  6,  6,  6,  6, -1,
    -1,  7,  7,  7,  7,  7,  7,  7,  7,  7, -1,
    -1,  8,  8,  8,  8,  8,  8,  8,  8,  8, -1,
    -1,  9,  9,  9,  9,  9,  9,  9,  9,  9, -1,
    -1, 10, 10, 10, 10, 10, 10, 10, 10, 10, -1,
    -1, 11, 11, 11, 11, 11, 11, 11, 11, 11, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
  ];

  // process PGN
  function gameToUCI(moves) {
    let uciMoves = [];
    
    // init new game
    engine.setBoard(engine.START_FEN);
    side = 0;
    
    for (let count = 0; count < moves.length; count++) {
      if (moves[count].length > 3) {
        let sourceSquare;
        let move = moves[count];
        let moveIndex = 0;
        
        // TODO handle more than 2 pawns in the file
        if (move[moveIndex] == '＋' || move[moveIndex] == '－') moveIndex = 1;
        
        // raw
        let type = move[moveIndex];
        let piece = ((side == 0) ? 'R' : 'B') + move[moveIndex];
        let sourceFile = move[moveIndex + 1];
        let direction = move[2];
        let secondNumber = move[3];

        // find piece on the same rank
        if (moveIndex) {
          let squares = [];
          
          for (let square = 0; square < 154; square++) {
            let searchPiece = engine.getPiece(square);
            if (searchPiece == CHAR_TO_PIECE[piece] && searchPiece != 15) {
              squares.push(square);
            }
          }

          let index;
          index = (side == 0 ? (move[0] == '＋' ? 0 : 1) : (move[0] == '＋' ? 1 : 0));
          sourceSquare = squares[index];          
        }
        
        // parsed
        let pieceCode = CHAR_TO_PIECE[piece];
        let fileFrom = FILE[side][sourceFile];
        
        // convert move to UCI format
        let uciMove = moveToUCI(type, pieceCode, fileFrom, direction, secondNumber, sourceSquare);
        
        if (uciMove == 'xxxx') {
          console.log('ERROR parsing move:', move);
        }
        
        engine.loadMoves(uciMove);
        uciMoves.push(uciMove);
        
        // change side
        side ^= 1;
      }
    }
    
    return uciMoves;
  }

  // parse move
  function moveToUCI(type, pieceCode, fileFrom, direction, secondNumber, sourceSquare) {
    let moves = engine.generateLegalMoves();
    let initialDirection = direction;

    for (let count = 0; count < moves.length; count++) {
      let move = moves[count].move;
      let movePiece = engine.getSourcePiece(move);
      let moveSource = engine.getSourceSquare(move);
      let moveTarget = engine.getTargetSquare(move);

      if (pieceCode == movePiece) {
        let rankFrom = MAP_RANK[moveSource];
        let candidateSource;
        
        if (sourceSquare) {
          candidateSource = sourceSquare;
          fileFrom = MAP_FILE[candidateSource];
          if (type == 'Ｐ' && direction == '＋') secondNumber = '１';
        } else {
          candidateSource = rankFrom * 11 + fileFrom;
        }

        if (direction == '＋' || direction == '－') {
          if (type == 'Ｐ' || type == 'Ｒ' || type == 'Ｃ' || type == 'Ｋ') {          
            if (candidateSource == moveSource) {            
              let offset = FILE[1][secondNumber]; // convert unicode to ascii
              let dirOffset = side == 0 ? ((direction == '＋') ? -offset : offset) : ((direction == '＋') ? offset : -offset)
              let rankTo = rankFrom + dirOffset;
              let fileTo = fileFrom;
              if ((rankTo * 11 + fileTo) == moveTarget) return engine.moveToString(move);
            }
          } else if (type == 'Ａ' || type == 'Ｈ' || type == 'Ｅ') {
            let fileTo = FILE[side][secondNumber];

            if (candidateSource == moveSource) {  
              let rankTo = MAP_RANK[moveTarget];
              let candidateTarget = rankTo * 11 + fileTo;

              if (candidateTarget == moveTarget) {
                if (initialDirection == '－') {
                  if (side == 0 ? (moveSource - moveTarget) < 0 : (moveSource - moveTarget) > 0) return engine.moveToString(move);
                } else if (initialDirection == '＋') {
                  if (side == 0 ? (moveSource - moveTarget) > 0 : (moveSource - moveTarget) < 0) return engine.moveToString(move);
                } 
              }
            }
          }
        } else if (direction == '＝') {
          let fileTo = FILE[side][secondNumber];

          if (candidateSource == moveSource) {
            let rankTo = MAP_RANK[moveTarget];
            let candidateTarget = rankTo * 11 + fileTo;
            if (candidateTarget == moveTarget) return engine.moveToString(move);
          } 
        }
      }
    }

    return 'xxxx';
  }
  
  return {

    /****************************\
     ============================
   
              PUBLIC API

     ============================              
    \****************************/
    
    gameToUCI: function(moves) { return gameToUCI(moves); }
  }
  
}

// export as nodejs module
if (typeof(exports) != 'undefined') exports.XiangqiPGNparser = XiangqiPGNparser;


















