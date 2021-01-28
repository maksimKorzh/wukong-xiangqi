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
    const NO_COLOR = 2;
    
    // piece encoding
    const EMPTY = 0;
    const RED_PAWN = 1;
    const RED_ADVISOR = 2;
    const RED_BISHOP = 3;
    const RED_KNIGHT = 4;
    const RED_CANNON = 5;
    const RED_ROOK = 6;
    const RED_KING = 7;
    const BLACK_PAWN = 8;
    const BLACK_ADVISOR = 9;
    const BLACK_BISHOP = 10;
    const BLACK_KNIGHT = 11;
    const BLACK_CANNON = 12;
    const BLACK_ROOK = 13;
    const BLACK_KING = 14;
    const OFFBOARD = 15;
    
    // piece types
    const PAWN = 16;
    const ADVISOR = 17;
    const BISHOP = 18;
    const KNIGHT = 19;
    const CANNON = 20;
    const ROOK = 21;
    const KING = 22;
    
    // map type to piece
    const PIECE_TYPE = [
      0, 
      PAWN, ADVISOR, BISHOP, KNIGHT, CANNON, ROOK, KING,
      PAWN, ADVISOR, BISHOP, KNIGHT, CANNON, ROOK, KING
    ];
    
    // map color to piece
    const PIECE_COLOR = [
      NO_COLOR,
      RED, RED, RED, RED, RED, RED, RED,
      BLACK, BLACK, BLACK, BLACK, BLACK, BLACK, BLACK
    ];  
    
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
    
    // almost unnique position identifier
    hashKey = 0;
    
    // squares occupied by kings
    var kingSquare = [0, 0];
    
    // move stack
    var moveStack = [];
    
    
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
      hashKey = 0;
      kingSquare = [0, 0];
      moveStack = [];
    }
    
    /****************************\
     ============================
   
      RANDOM NUMBER GENERATOR
   
     ============================              
    \****************************/
      
    // fixed random seed
    var randomState = 1804289383;

    // generate 32-bit pseudo legal numbers
    function random() {
      var number = randomState;
      
      // 32-bit XOR shift
      number ^= number << 13;
      number ^= number >> 17;
      number ^= number << 5;
      randomState = number;

      return number;
    }

    
    /****************************\
     ============================
     
             ZOBRIST KEYS

     ============================              
    \****************************/ 
   
    // random keys
    var pieceKeys = new Array(15 * 154);
    var sideKey;
    
    // init random hash keys
    function initRandomKeys() {
      for (var index = 0; index < pieceKeys.length; index++) pieceKeys[index] = random();
      sideKey = random();
    }
    
    // generate hash key
    function generateHashKey() {
      var finalKey = 0;
      
      // hash board position
      for (var square = 0; square < board.length; square++) {
        if (board[square] != OFFBOARD) {
          let piece = board[square];
          if (piece != EMPTY) finalKey ^= pieceKeys[(piece * board.length) + square];
        }
      }
      
      // hash board state variables
      if (side == RED) finalKey ^= sideKey;
      
      return finalKey;
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
      'C': RED_CANNON,
      'R': RED_ROOK,
      'K': RED_KING,
      'p': BLACK_PAWN,
      'a': BLACK_ADVISOR,
      'b': BLACK_BISHOP, 'e': BLACK_BISHOP,
      'n': BLACK_KNIGHT, 'h': BLACK_KNIGHT,
      'c': BLACK_CANNON,
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
          
          if (board[square] != OFFBOARD) {
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
      
      // generate hash key
      hashKey = generateHashKey();
    }
    
    // print board to console
    function printBoard() {
      let boardString = '';
      
      // print board position
      for (let rank = 0; rank < 14; rank++) {
        for (let file = 0; file < 11; file++) {
          let square = rank * 11 + file;

          if (board[square] != OFFBOARD) {
            if (file == 1) boardString += 11 - rank + '  ';
            boardString += PIECE_TO_CHAR[board[square]] + ' ';

          }
        }
        
        if (rank < 13) boardString += '\n';
      }
      
      boardString += '   a b c d e f g h i\n\n'
      boardString += '   side:           ' + ((side == RED) ? 'r' : 'b') + '\n';
      boardString += '   hash key:      ' + hashKey + '\n';
      boardString += '   king squares:  [' + COORDINATES[kingSquare[RED]] + ', ' +
                                             COORDINATES[kingSquare[BLACK]] + ']\n'
      console.log(boardString);
    }
    
    // print pseudo legal move list
    function printMoveList(moveList) {
      var listMoves = '   Move    Piece   Captured   Flag   Score\n\n';
      
      for (var index = 0; index < moveList.length; index++) {
        let move = moveList[index].move;
        listMoves += '   ' + COORDINATES[getSourceSquare(move)] + COORDINATES[getTargetSquare(move)];
        listMoves += '    ' + PIECE_TO_CHAR[getSourcePiece(move)] +
                     '       ' + PIECE_TO_CHAR[getTargetPiece(move)] +
                     '          ' + getCaptureFlag(move) +
                     '      ' + moveList[index].score + '\n';
      }
      
      listMoves += '\n   Total moves: ' + moveList.length;
      console.log(listMoves);
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
    
    // offsets to get attacks by pawns
    const PAWN_MOVE_OFFSETS = [
      [UP, LEFT, RIGHT],
      [DOWN, LEFT, RIGHT]
    ];
    
    // offsets to get target squares for knights
    const KNIGHT_MOVE_OFFSETS = [
      [LEFT + LEFT + UP, LEFT + LEFT + DOWN],
      [RIGHT + RIGHT + UP, RIGHT + RIGHT + DOWN],
      [UP + UP + LEFT, UP + UP + RIGHT],
      [DOWN + DOWN + LEFT, DOWN + DOWN + RIGHT]
    ];
    
    // offsets to get target squares for bishops
    const BISHOP_MOVE_OFFSETS = [(UP + LEFT) * 2, (UP + RIGHT) * 2, (DOWN + LEFT) * 2, (DOWN + RIGHT) * 2];
    
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
      
      // by king, rooks & cannons
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
          if (jumpOver == 2 && board[directionTarget] == ((color == RED) ? RED_CANNON : BLACK_CANNON))
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
   
            MOVE GENERATOR

     ============================              
    \****************************/
    
    // zones of xiangqi board
    const BOARD_ZONES = [
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 2, 2, 2, 1, 1, 1, 0,
        0, 1, 1, 1, 2, 2, 2, 1, 1, 1, 0,
        0, 1, 1, 1, 2, 2, 2, 1, 1, 1, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 1, 1, 2, 2, 2, 1, 1, 1, 0,
        0, 1, 1, 1, 2, 2, 2, 1, 1, 1, 0,
        0, 1, 1, 1, 2, 2, 2, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ]
    ];

    /*
                               MOVE ENCODING
    
        0000 0000 0000 0000 0000 1111 1111  source square  0xFF
        0000 0000 0000 1111 1111 0000 0000  target square  0xFF00
        0000 0000 1111 0000 0000 0000 0000   source piece  0xF0000
        0000 1111 0000 0000 0000 0000 0000   target piece  0xF00000
        0001 0000 0000 0000 0000 0000 0000   capture flag  0x1000000
    */
    
    // store squares & pieces into a single number
    function encodeMove(sourceSquare, targetSquare, sourcePiece, targetPiece, captureFlag) {
      return (sourceSquare) |
             (targetSquare << 8) |
             (sourcePiece << 16) |
             (targetPiece << 20) |
             (captureFlag << 24)
    }
    
    function getSourceSquare(move) { return move & 0xFF }
    function getTargetSquare(move) { return (move >> 8) & 0xFF }
    function getSourcePiece(move) { return (move >> 16) & 0xF }
    function getTargetPiece(move) { return (move >> 20) & 0xF }
    function getCaptureFlag(move) { return (move >> 24) & 0x1 }
    
    // push move into move list
    function pushMove(moveList, sourceSquare, targetSquare, sourcePiece, targetPiece) {
      if (targetPiece == EMPTY || PIECE_COLOR[targetPiece] == side ^ 1) {
        let move = 0;
        
        if (targetPiece) move = encodeMove(sourceSquare, targetSquare, sourcePiece, targetPiece, 1);
        else move = encodeMove(sourceSquare, targetSquare, sourcePiece, targetPiece, 0);
        
        let moveScore = 0;
        
        moveList.push({
          move: move,
          score: moveScore
        });
      }
    }
    
    // generate pseudo legal moves
    function generateMoves() {
      let moveList = [];
      
      for (let sourceSquare = 0; sourceSquare < board.length; sourceSquare++) {
        if (board[sourceSquare] != OFFBOARD) {
          let piece = board[sourceSquare];
          let pieceType = PIECE_TYPE[piece];
          let pieceColor = PIECE_COLOR[piece];
          
          if (pieceColor == side) {
            // pawns
            if (pieceType == PAWN) {
              for (let direction = 0; direction < PAWN_MOVE_OFFSETS[side].length; direction++) {
                let targetSquare = sourceSquare + PAWN_MOVE_OFFSETS[side][direction];
                let targetPiece = board[targetSquare];
                
                if (targetPiece != OFFBOARD) pushMove(moveList, sourceSquare, targetSquare, board[sourceSquare], targetPiece);
                if (BOARD_ZONES[side][sourceSquare]) break; 
              }
            }
            
            // kings & advisors
            if (pieceType == KING || pieceType == ADVISOR) {
              for (let direction = 0; direction < ORTHOGONALS.length; direction++) {
                let offsets = (pieceType == KING) ? ORTHOGONALS : DIAGONALS;
                let targetSquare = sourceSquare + offsets[direction];
                let targetPiece = board[targetSquare];
                
                if (BOARD_ZONES[side][targetSquare] == 2) pushMove(moveList, sourceSquare, targetSquare, board[sourceSquare], targetPiece);
              }
            }
            
            // bishops
            if (pieceType == BISHOP) {
              for (let direction = 0; direction < BISHOP_MOVE_OFFSETS.length; direction++) {
                let targetSquare = sourceSquare + BISHOP_MOVE_OFFSETS[direction];
                let jumpOver = sourceSquare + DIAGONALS[direction];
                let targetPiece = board[targetSquare];
                
                if (BOARD_ZONES[side][targetSquare] && board[jumpOver] == EMPTY) pushMove(moveList, sourceSquare, targetSquare, board[sourceSquare], targetPiece);
              }
            }
            
            // knights
            if (pieceType == KNIGHT) {
              for (let direction = 0; direction < ORTHOGONALS.length; direction++) {
                let targetDirection = sourceSquare + ORTHOGONALS[direction];
          
                if (board[targetDirection] == EMPTY) {
                  for (let offset = 0; offset < 2; offset++) {
                    let targetSquare = sourceSquare + KNIGHT_MOVE_OFFSETS[direction][offset];
                    let targetPiece = board[targetSquare];
                    
                    if (targetPiece != OFFBOARD) pushMove(moveList, sourceSquare, targetSquare, board[sourceSquare], targetPiece);
                  }
                }
              }
            }
            
            // rooks & cannons
            if (pieceType == ROOK || pieceType == CANNON) {
              for (let direction = 0; direction < ORTHOGONALS.length; direction++) {
                let targetSquare = sourceSquare + ORTHOGONALS[direction];
                let jumpOver = 0;
                
                while (board[targetSquare] != OFFBOARD) {
                  let targetPiece = board[targetSquare];
                  
                  if (jumpOver == 0) {
                    // all rook moves
                    if (pieceType == ROOK && PIECE_COLOR[targetPiece] == side ^ 1)
                      pushMove(moveList, sourceSquare, targetSquare, board[sourceSquare], targetPiece);
                    
                    // quiet cannon moves
                    else if (pieceType == CANNON && targetPiece == EMPTY)
                      pushMove(moveList, sourceSquare, targetSquare, board[sourceSquare], targetPiece);
                  }

                  if (targetPiece) jumpOver++;
                  if (targetPiece && pieceType == CANNON && PIECE_COLOR[targetPiece] == side ^ 1 && jumpOver == 2) {
                    // capture cannon moves
                    pushMove(moveList, sourceSquare, targetSquare, board[sourceSquare], targetPiece);
                    break;
                  }

                  targetSquare += ORTHOGONALS[direction];
                }
              }
            }
          }
        }
      }
      
      return moveList;
    }


    /****************************\
     ============================
   
        MAKE MOVE / TAKE BACK

     ============================              
    \****************************/
    
    // make move
    function makeMove(move) {
      // moveStack board state variables
      moveStack.push({
        move: move,
        hashKey: hashKey,
        sixty: sixty
      });
      
      // parse move
      let sourceSquare = getSourceSquare(move);
      let targetSquare = getTargetSquare(move);
      let sourcePiece = getSourcePiece(move);
      let targetPiece = getTargetPiece(move);
      let captureFlag = getCaptureFlag(move);

      // move piece
      board[targetSquare] = sourcePiece;
      board[sourceSquare] = EMPTY;
      
      // hash piece
      hashKey ^= pieceKeys[sourcePiece * board.length + sourceSquare];
      hashKey ^= pieceKeys[sourcePiece * board.length + targetSquare];
      
      if (captureFlag) {
        sixty = 0;
        hashKey ^= pieceKeys[targetPiece * board.length + targetSquare];
      }
      else sixty++;

      // update king square
      if (board[targetSquare] == RED_KING || board[targetSquare] == BLACK_KING)
        kingSquare[side] = targetSquare;
      
      // switch side to move
      side ^= 1;
      hashKey ^= sideKey;

      // return illegal move if king is left in check 
      if (isSquareAttacked(kingSquare[side ^ 1], side)) {
        takeBack();
        return 0;
      } else return 1;
    }
    
    // take back
    function takeBack() {
      // parse move
      let moveIndex = moveStack.length - 1;
      let move = moveStack[moveIndex].move;    
      let sourceSquare = getSourceSquare(move);
      let targetSquare = getTargetSquare(move);
      let sourcePiece = getSourcePiece(move);
      let targetPiece = getTargetPiece(move);
      
      // move piece
      board[sourceSquare] = sourcePiece;
      board[targetSquare] = EMPTY;
      
      // restore captured piece
      if (getCaptureFlag(move)) {
        board[targetSquare] = targetPiece;
      }
      
      // update king square
      if (board[sourceSquare] == RED_KING || board[sourceSquare] == BLACK_KING)
        kingSquare[side ^ 1] = sourceSquare;

      // switch side to move
      side ^= 1;
           
      sixty = moveStack[moveIndex].sixty;
      hashKey = moveStack[moveIndex].hashKey;
      moveStack.pop();
    }
    
    /****************************\
     ============================
   
                 PERFT

     ============================              
    \****************************/
    
    /*
      rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1
      depth       nodes    checks    captures
          1          44         0           2
          2        1920         6          72
          3       79666       384        3159
          4     3290240     19380      115365
          5   133312995    953251     4917734  
          6  5392831844


      r1ba1a3/4kn3/2n1b4/pNp1p1p1p/4c4/6P2/P1P2R2P/1CcC5/9/2BAKAB2 w - - 0 1
      depth       nodes    checks    captures
          1          38         1           1
          2        1128        12          10
          3       43929      1190        2105
          4     1339047     21299       31409
          5    53112976   1496697     3262495
    */
    
    // perft driver
    function perftDriver(depth) {
      if  (depth == 0) { nodes++; return; }
      
      let moveList = generateMoves();
      
      for (var count = 0; count < moveList.length; count++) {      
        if (!makeMove(moveList[count].move)) continue;
        perftDriver(depth - 1);      
        takeBack();
      }
    }
    
    // perft test
    function perftTest(depth) {
      nodes = 0;
      console.log('   Performance test:\n');
      resultString = '';
      let startTime = Date.now();
      
      let moveList = generateMoves();
      
      for (var count = 0; count < moveList.length; count++) {
        if (makeMove(moveList[count].move) == 0) continue;
        let cumNodes = nodes;
        perftDriver(depth - 1);
        takeBack();
        let oldNodes = nodes - cumNodes;
        console.log(  '   move' +
                      ' ' + (count + 1) + ((count < 9) ? ':  ': ': ') +
                      COORDINATES[getSourceSquare(moveList[count].move)] +
                      COORDINATES[getTargetSquare(moveList[count].move)] +
                      '    nodes: ' + oldNodes);
      }
      
      resultString += '\n   Depth: ' + depth;
      resultString += '\n   Nodes: ' + nodes;
      resultString += '\n    Time: ' + (Date.now() - startTime) + ' ms\n';
      console.log(resultString);
    }

    /****************************\
     ============================
   
              EVALUATION

     ============================              
    \****************************/
    
    /*
        I took evaluation parameters from Mark Dirish's
        javascript xiangqi engine: https://github.com/markdirish/xiangqi
        
        Credits to initial sources (from Mark's sources):
        
        material weights: by Yen et al. 2004, "Computer Chinese Chess" ICGA Journal
             PST weights: by Li, Cuanqi 2008, "Using AdaBoost to Implement Chinese
                                               Chess Evaluation Functions", UCLA thesis
    */
    
    // evaluate types       P  A  B  N  C  R  K 
    const EVALUATE_TYPES = [1, 0, 0, 1, 1, 1, 0];

    // material weights
    const MATERIAL_WEIGHTS = [
      //  P     A     B     N     C     R      K   
      0, 30,  120,  120,  270,  285,  600,  6000,
      
      //  p     a     b     n     c     r      k
        -30, -120, -120, -270, -285, -600, -6000
    ];

    // piece square tables
    const PST = [
      // pawns
      [
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   3,   6,   9,  12,   9,   6,   3,   0,   0,
        0,  18,  36,  56,  80, 120,  80,  56,  36,  18,   0,
        0,  14,  26,  42,  60,  80,  60,  42,  26,  14,   0, 
        0,  10,  20,  30,  34,  40,  34,  30,  20,  10,   0, 
        0,   6,  12,  18,  18,  20,  18,  18,  12,   6,   0, 
        0,   2,   0,   8,   0,   8,   0,   8,   0,   2,   0, 
        0,   0,   0,  -2,   0,   4,   0,  -2,   0,   0,   0, 
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0
      ],
      
      
      [],  // skip advisors
      [],  // skip bishops
      
      // knights
      [
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   4,   8,  16,  12,   4,  12,  16,   8,   4,   0,
        0,   4,  10,  28,  16,   8,  16,  28,  10,   4,   0, 
        0,  12,  14,  16,  20,  18,  20,  16,  14,  12,   0, 
        0,   8,  24,  18,  24,  20,  24,  18,  24,   8,   0, 
        0,   6,  16,  14,  18,  16,  18,  14,  16,   6,   0, 
        0,   4,  12,  16,  14,  12,  14,  16,  12,   4,   0, 
        0,   2,   6,   8,   6,  10,   6,   8,   6,   2,   0, 
        0,   4,   2,   8,   8,   4,   8,   8,   2,   4,   0, 
        0,   0,   2,   4,   4,  -2,   4,   4,   2,   0,   0, 
        0,   0,  -4,   0,   0,   0,   0,   0,  -4,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0
      ],
      
      // cannon
      [
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   6,   4,   0, -10, -12, -10,   0,   4,   6,   0,
        0,   2,   2,   0,  -4, -14,  -4,   0,   2,   2,   0, 
        0,   2,   2,   0, -10,  -8, -10,   0,   2,   2,   0, 
        0,   0,   0,  -2,   4,  10,   4,  -2,   0,   0,   0, 
        0,   0,   0,   0,   2,   8,   2,   0,   0,   0,   0, 
        0,  -2,   0,   4,   2,   6,   2,   4,   0,  -2,   0, 
        0,   0,   0,   0,   2,   4,   2,   0,   0,   0,   0, 
        0,   4,   0,   8,   6,  10,   6,   8,   0,   4,   0, 
        0,   0,   2,   4,   6,   6,   6,   4,   2,   0,   0, 
        0,   0,   0,   2,   6,   6,   6,   2,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0
      ],
      
      // rooks
      [
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,  14,  14,  12,  18,  16,  18,  12,  14,  14,   0,
        0,  16,  20,  18,  24,  26,  24,  18,  20,  16,   0, 
        0,  12,  12,  12,  18,  18,  18,  12,  12,  12,   0, 
        0,  12,  18,  16,  22,  22,  22,  16,  18,  12,   0, 
        0,  12,  14,  12,  18,  18,  18,  12,  14,  12,   0, 
        0,  12,  16,  14,  20,  20,  20,  14,  16,  12,   0, 
        0,   6,  10,   8,  14,  14,  14,   8,  10,   6,   0, 
        0,   4,   8,   6,  14,  12,  14,   6,   8,   4,   0, 
        0,   8,   4,   8,  16,   8,  16,   8,   4,   8,   0, 
        0,  -2,  10,   6,  14,  12,  14,   6,  10,  -2,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0
      ],
      
      []  // skip kings
    ];
    
    // mirror square for black
    const MIRROR_SQUARE = [
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
      0,  A0,  B0,  C0,  D0,  E0,  F0,  G0,  H0,  I0,   0,
      0,  A1,  B1,  C1,  D1,  E1,  F1,  G1,  H1,  I1,   0,
      0,  A2,  B2,  C2,  D2,  E2,  F2,  G2,  H2,  I2,   0,
      0,  A3,  B3,  C3,  D3,  E3,  F3,  G3,  H3,  I3,   0,
      0,  A4,  B4,  C4,  D4,  E4,  F4,  G4,  H4,  I4,   0,
      0,  A5,  B5,  C5,  D5,  E5,  F5,  G5,  H5,  I5,   0,
      0,  A6,  B6,  C6,  D6,  E6,  F6,  G6,  H6,  I6,   0,
      0,  A7,  B7,  C7,  D7,  E7,  F7,  G7,  H7,  I7,   0,
      0,  A8,  B8,  C8,  D8,  E8,  F8,  G8,  H8,  I8,   0,
      0,  A9,  B9,  C9,  D9,  E9,  F9,  G9,  H9,  I9,   0,
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0
    ];
    
    // static evaluation
    function evaluate() {
      let score = 0;
      
      for (let square = 0; square < board.length; square++) {
        if (board[square] != OFFBOARD) {
          if (board[square]) {
            let piece = board[square];
            let pstIndex = PIECE_TYPE[piece] - 16;
            let pieceColor = PIECE_COLOR[piece];
            
            // material score
            score += MATERIAL_WEIGHTS[piece];
            
            // positional score
            if (EVALUATE_TYPES[pstIndex]) {
              if (pieceColor == RED) score += PST[pstIndex][square]
              else score -= PST[pstIndex][MIRROR_SQUARE[square]];
            }
          }
        }
      }
      
      return (side == RED) ? score : -score;
    }

    /****************************\
     ============================
   
                SEARCH

     ============================              
    \****************************/
    
    // visited nodes count
    var nodes = 0;
    
    
    /****************************\
     ============================
   
                 INIT

     ============================              
    \****************************/
    
    // init engine
    (function initAll() {
      initRandomKeys();
    }());
    
    
    /****************************\
     ============================
   
                 DEBUG

     ============================              
    \****************************/
    
    // debug engine
    function debug() {
      //setBoard(START_FEN);
      //setBoard('r1ba1a3/4kn3/2n1b4/pNp1p1p1p/4c4/6P2/P1P2R2P/1CcC5/9/2BAKAB2 w - - 0 1');
      setBoard('rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1CC51/9/RNBAKABNR w - - 0 1');
      printBoard();
      console.log(evaluate());
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

