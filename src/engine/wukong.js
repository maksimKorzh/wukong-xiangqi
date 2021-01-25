/************************************************\
 ================================================
 
                      WUKONG
            javascript Xiang Qi engine
           
                        by
                        
                 Code Monkey King
 
 ===============================================
\************************************************/

var Engine = function() {
    // engine version
    const VERSION = '1.0';
    
    // starting position
    const START_FEN = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';
    
    // sides to move
    const RED = 0;
    const BLACK = 1;
    
    // piece encoding
    const EMPTY = 0;
    const RED_PAWN = 1;
    const RED_ADVISOR = 2;
    const RED_BISHOP = 3;
    const RED_KNIGHT = 4;
    const RED_CANON = 5;
    const RED_ROOK = 6;
    const RED_KING = 7;
    const BLACK_PAWN = 8;
    const BLACK_ADVISOR = 9;
    const BLACK_BISHOP = 10;
    const BLACK_KNIGHT = 11;
    const BLACK_CANON = 12;
    const BLACK_ROOK = 13;
    const BLACK_KING = 14;
    const OFFBOARD = 15;    
    
    // square encoding
    const A9 = 23, B9 = 24, C9 = 25, D9 = 26, E9 = 27, F9 = 28, G9 = 29, H9 = 30, I9 = 31;
    const A8 = 34, B8 = 35, C8 = 36, D8 = 37, E8 = 38, F8 = 39, G8 = 40, H8 = 41, I8 = 42;
    const A7 = 45, B7 = 46, C7 = 47, D7 = 48, E7 = 49, F7 = 50, G7 = 51, H7 = 52, I7 = 53;
    const A6 = 56, B6 = 57, C6 = 58, D6 = 59, E6 = 60, F6 = 61, G6 = 62, H6 = 63, I6 = 64;
    const A5 = 67, B5 = 68, C5 = 69, D5 = 70, E5 = 71, F5 = 72, G5 = 73, H5 = 74, I5 = 75;
    const A4 = 78, B4 = 79, C4 = 80, D4 = 81, E4 = 82, F4 = 83, G4 = 84, H4 = 85, I4 = 86;
    const A3 = 89, B3 = 90, C3 = 91, D3 = 92, E3 = 93, F3 = 94, G3 = 95, H3 = 96, I3 = 97;
    const A2 = 100, B2 = 101, C2 = 102, D2 = 103, E2 = 104, F2 = 105, G2 = 106, H2 = 107, I2 = 108;
    const A1 = 111, B1 = 112, C1 = 113, D1 = 114, E1 = 115, F1 = 116, G1 = 117, H1 = 118, I1 = 119;
    const A0 = 122, B0 = 123, C0 = 124, D0 = 125, E0 = 126, F0 = 127, G0 = 128, H0 = 129, I0 = 130;
    
    // array to convert board square indices to coordinates
    const COORDINATES = [
      'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 
      'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 
      'xx', 'a9', 'b9', 'c9', 'd9', 'e9', 'f9', 'g9', 'h9', 'i9', 'xx', 
      'xx', 'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', 'i8', 'xx', 
      'xx', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', 'i7', 'xx', 
      'xx', 'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', 'i6', 'xx', 
      'xx', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', 'i5', 'xx', 
      'xx', 'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', 'i4', 'xx', 
      'xx', 'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', 'i3', 'xx', 
      'xx', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', 'i2', 'xx', 
      'xx', 'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', 'i1', 'xx', 
      'xx', 'a0', 'b0', 'c0', 'd0', 'e0', 'f0', 'g0', 'h0', 'i0', 'xx', 
      'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 
      'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'
    ];
    
    
    /****************************\
     ============================
   
            BOARD VARIABLES

     ============================              
    \****************************/
    
    /*
        PABNCRK      pabncrk
        兵仕相傌炮俥帥  卒士象馬炮車將
        
        Board representation
           (11x14 Mailbox)
        
        x x x x x x x x x x x
        x x x x x x x x x x x
        x r n b a k a b n r x
        x . . . . . . . . . x
        x . c . . . . . c . x
        x p . p . p . p . p x
        x . . . . . . . . . x
        x . . . . . . . . . x
        x P . P . P . P . P x
        x . C . . . . . C . x
        x . . . . . . . . . x
        x R N B A K A B N R x
        x x x x x x x x x x x
        x x x x x x x x x x x
    */
    
    // xiangqi board
    var board = new Array(11 * 14);
    
    // side to move
    var side = RED;
    
    // 60 moves draw rule counter
    var sixty = 0;
    
    // squares occupied by kings
    var kingSquare = [0, 0];
    
    
    /****************************\
     ============================
   
             BOARD METHODS

     ============================              
    \****************************/
    
    // reset board array and game state variables
    function resetBoard() {
      // reset board position
      for (let rank = 0; rank < 14; rank++) {
        for (let file = 0; file < 11; file++) {
          let square = rank * 11 + file;
          if (COORDINATES[square] != 'xx') board[square] = EMPTY;
          else board[square] = OFFBOARD;
        }
      }
      
      // reset game state variables
      side = RED;
      sixty = 0;
      kingSquare = [0, 0];
    }
    
    
    /****************************\
     ============================
     
            INPUT & OUTPUT
            
     ============================              
    \****************************/
    
    // encode ascii pieces
    const CHAR_TO_PIECE = {
      'P': RED_PAWN,
      'A': RED_ADVISOR,
      'B': RED_BISHOP, 'E': RED_BISHOP,
      'N': RED_KNIGHT, 'H': RED_BISHOP,
      'C': RED_CANON,
      'R': RED_ROOK,
      'K': RED_KING,
      'p': BLACK_PAWN,
      'a': BLACK_ADVISOR,
      'b': BLACK_BISHOP, 'e': BLACK_BISHOP,
      'n': BLACK_KNIGHT, 'h': BLACK_KNIGHT,
      'c': BLACK_CANON,
      'r': BLACK_ROOK,
      'k': BLACK_KING
    };
  
    // ascii character piece representation
    const PIECE_TO_CHAR = ['.', 'P', 'A', 'B', 'N', 'C', 'R', 'K', 'p', 'a', 'b', 'n', 'c', 'r', 'k'];
    
    // set board position from FEN string
    function setBoard(fen) {
      resetBoard();
      var index = 0;
      
      // parse position
      for (let rank = 0; rank < 14; rank++) {
        for (let file = 0; file < 11; file++) {
          let square = rank * 11 + file;
          
          if (COORDINATES[square] != 'xx') {
            // parse pieces
            if ((fen[index].charCodeAt() >= 'a'.charCodeAt() &&
                 fen[index].charCodeAt() <= 'z'.charCodeAt()) || 
                (fen[index].charCodeAt() >= 'A'.charCodeAt() &&
                 fen[index].charCodeAt() <= 'Z'.charCodeAt())) {
              if (fen[index] == 'K') kingSquare[RED] = square;
              else if (fen[index] == 'k') kingSquare[BLACK] = square;
              board[square] = CHAR_TO_PIECE[fen[index]];
              index++;
            }
            
            // parse empty squares
            if (fen[index].charCodeAt() >= '0'.charCodeAt() &&
                fen[index].charCodeAt() <= '9'.charCodeAt()) {
              var offset = fen[index] - '0';
              if (board[square] == EMPTY) file--;
              file += offset;
              index++;
            }
            if (fen[index] == '/') index++;
          }
        }
      }
      
      // parse side to move
      index++;
      side = (fen[index] == 'b') ? BLACK : RED;
    }
    
    // print board to console
    function printBoard() {
      let boardString = '';
      
      // print board position
      for (let rank = 0; rank < 14; rank++) {
        for (let file = 0; file < 11; file++) {
          let square = rank * 11 + file;

          if (COORDINATES[square] != 'xx') {
            if (file == 1) boardString += 11 - rank + '  ';
            boardString += PIECE_TO_CHAR[board[square]] + ' ';

          }
        }
        
        if (rank < 13) boardString += '\n';
      }
      
      boardString += '   a b c d e f g h i\n\n'
      boardString += '   side:           ' + ((side == RED) ? 'r' : 'b') + '\n';
      boardString += '   king squares:  [' + COORDINATES[kingSquare[RED]] + ', ' +
                                             COORDINATES[kingSquare[BLACK]] + ']\n'
      console.log(boardString);
    }
    
    
    /****************************\
     ============================
   
               ATTACKS

     ============================              
    \****************************/
    
    // directions
    const UP = -11;
    const DOWN = 11;
    const LEFT = -1;
    const RIGHT = 1;
    
    // piece move offsets
    const ORTHOGONALS = [LEFT, RIGHT, UP, DOWN];
    const DIAGONALS = [UP + LEFT, UP + RIGHT, DOWN + LEFT, DOWN + RIGHT];
    
    // offsets to get attacks by pawns
    const PAWN_ATTACK_OFFSETS = [
      [DOWN, LEFT, RIGHT],
      [UP, LEFT, RIGHT]
    ];
    
    // offsets to get attacks by knights
    const KNIGHT_ATTACK_OFFSETS = [
      [UP + UP + LEFT, LEFT + LEFT + UP],
      [UP + UP + RIGHT, RIGHT + RIGHT + UP],
      [DOWN + DOWN + LEFT, LEFT + LEFT + DOWN],
      [RIGHT + RIGHT + DOWN, DOWN + DOWN + RIGHT]
    ];
    
    /*const KNIGHT_MOVE_OFFSETS = [
      [LEFT + LEFT + UP, LEFT + LEFT + DOWN],
      [RIGHT + RIGHT + UP, RIGHT + RIGHT + DOWN],
      [UP + UP + LEFT, UP + UP + RIGHT],
      [DOWN + DOWN + LEFT, DOWN + DOWN + RIGHT]
    ];
    
    const BISHOP_OFFSETS = [(UP + LEFT) * 2, (UP + RIGHT) * 2, (DOWN + LEFT) * 2, (DOWN + RIGHT) * 2];
    */
    
    const ROOK_OFFSETS = ORTHOGONALS;
    const KING_OFFSETS = ORTHOGONALS;
    
    // print board to console
    function printAttacks(color) {
      let boardString = '';
      
      // print board position
      for (let rank = 0; rank < 14; rank++) {
        for (let file = 0; file < 11; file++) {
          let square = rank * 11 + file;

          if (COORDINATES[square] != 'xx') {
            if (file == 1) boardString += '   ';
            boardString += (isSquareAttacked(square, color) ? 'x ' : '. ');

          }
        }
        
        if (rank < 13) boardString += '\n';
      }
      
      console.log(boardString);
    }
    
    // square attacked by the given side
    function isSquareAttacked(square, color) {
      // by knights
      for (let direction = 0; direction < DIAGONALS.length; direction++) {
        let directionTarget = square + DIAGONALS[direction];
        
        if (board[directionTarget] == EMPTY) {
          for (let offset = 0; offset < 2; offset++) {
            let knightTarget = square + KNIGHT_ATTACK_OFFSETS[direction][offset];
            if (board[knightTarget] == ((color == RED) ? RED_KNIGHT : BLACK_KNIGHT)) return 1;
          }
        }
      }
      
      // by king, rooks & canons
      for (let direction = 0; direction < ORTHOGONALS.length; direction++) {
        let directionTarget = square + ORTHOGONALS[direction];
        let jumpOver = 0;
        
        while (board[directionTarget] != OFFBOARD) {
          if (jumpOver == 0) {
            if (board[directionTarget] == ((color == RED) ? RED_ROOK : BLACK_ROOK) ||
              board[directionTarget] == ((color == RED) ? RED_KING : BLACK_KING))
              return 1;
          }

          if (board[directionTarget] != EMPTY) jumpOver++;
          if (jumpOver == 2 && board[directionTarget] == ((color == RED) ? RED_CANON : BLACK_CANON))
            return 1;
          
          directionTarget += ORTHOGONALS[direction];
        }
      }
      
      // by pawns
      for (let direction = 0; direction < PAWN_ATTACK_OFFSETS[color].length; direction++) {
        let directionTarget = square + PAWN_ATTACK_OFFSETS[color][direction];
        if (board[directionTarget] == ((color == RED) ? RED_PAWN : BLACK_PAWN)) return 1;
      }
      
      return 0;
    }
    
    
    /****************************\
     ============================
   
                 INIT

     ============================              
    \****************************/
    
    // init engine
    (function initAll() {
      
    }());
    
    
    /****************************\
     ============================
   
                 DEBUG

     ============================              
    \****************************/
    
    // debug engine
    function debug() {
      //setBoard(START_FEN);
      setBoard('9/9/9/9/9/9/9/9/9/9 w - - 0 1');
      //board[D5] = RED_PAWN
      board[E1] = BLACK_PAWN;
      
      printBoard();
      printAttacks(BLACK);
      
    }
    
    return {

      /****************************\
       ============================
     
                PUBLIC API

       ============================              
      \****************************/
      
      // debug engine
      debug: function() { debug(); }
      
    }
}


/*
let ranks = ['x', 'x', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0', 'x', 'x'];
let files = ['x', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'x'];

let str = '';

for (let rank = 0; rank < 14; rank++) {
  for (let file = 0; file < 11; file++) {
    let square = rank * 11 + file;
    str += files[file] + ranks[rank] + " = " + square + ', ';
  }
  
  str += '\n'
}

console.log(str);
*/



















