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
    const WHITE_PAWN = 1;
    const WHITE_ADVISOR = 2;
    const WHITE_BISHOP = 3;
    const WHITE_KNIGHT = 4;
    const WHITE_CANON = 5;
    const WHITE_ROOK = 6;
    const WHITE_KING = 7;
    const BLACK_PAWN = 8;
    const BLACK_ADVISOR = 9;
    const BLACK_BISHOP = 10;
    const BLACK_KNIGHT = 11;
    const BLACK_CANON = 12;
    const BLACK_ROOK = 13;
    const BLACK_KING = 14;
    const OFFBOARD = 15;
    
    // square encoding
    const a9 = 23, b9 = 24, c9 = 25, d9 = 26, e9 = 27, f9 = 28, g9 = 29, h9 = 30, i9 = 31;
    const a8 = 34, b8 = 35, c8 = 36, d8 = 37, e8 = 38, f8 = 39, g8 = 40, h8 = 41, i8 = 42;
    const a7 = 45, b7 = 46, c7 = 47, d7 = 48, e7 = 49, f7 = 50, g7 = 51, h7 = 52, i7 = 53;
    const a6 = 56, b6 = 57, c6 = 58, d6 = 59, e6 = 60, f6 = 61, g6 = 62, h6 = 63, i6 = 64;
    const a5 = 67, b5 = 68, c5 = 69, d5 = 70, e5 = 71, f5 = 72, g5 = 73, h5 = 74, i5 = 75;
    const a4 = 78, b4 = 79, c4 = 80, d4 = 81, e4 = 82, f4 = 83, g4 = 84, h4 = 85, i4 = 86;
    const a3 = 89, b3 = 90, c3 = 91, d3 = 92, e3 = 93, f3 = 94, g3 = 95, h3 = 96, i3 = 97;
    const a2 = 100, b2 = 101, c2 = 102, d2 = 103, e2 = 104, f2 = 105, g2 = 106, h2 = 107, i2 = 108;
    const a1 = 111, b1 = 112, c1 = 113, d1 = 114, e1 = 115, f1 = 116, g1 = 117, h1 = 118, i1 = 119;
    const a0 = 122, b0 = 123, c0 = 124, d0 = 125, e0 = 126, f0 = 127, g0 = 128, h0 = 129, i0 = 130;
    
    // array to convert board square indices to coordinates
    const coordinates = [
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
    
    /*
        PABNCRK      pabncrk
        兵仕相傌炮俥帥  卒士象馬炮車將
        
        Board representation
           (11x14 Mailbox)
        
        x x x x x x x x x x x
        x x x x x x x x x x x
        x r n b a k a b n r x
        x . c . . . . . c . x
        x p . p . p . p . p x
        x . . . . . . . . . x
        x . . . . . . . . . x
        x . . . . . . . . . x
        x P . P . P . P . P x
        x . C . . . . . C . x
        x . . . . . . . . . x
        x R N B A K A B N R x
        x x x x x x x x x x x
        x x x x x x x x x x x
    */
    
    // debug engine
    function debug() {
      console.log(a9);
      console
      console.log(coordinates[a9]);
      console.log(coordinates[i9]);
      console.log(coordinates[a0]);
      console.log(coordinates[i0]);
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
let files = ['x', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'x'];

let str = '';

for (let rank = 0; rank < 14; rank++) {
  for (let file = 0; file < 11; file++) {
    let square = rank * 11 + file;
    str += "'" + files[file] + ranks[rank] + "'" + ', ';
  }
  
  str += '\n'
}

console.log(str);
*/


















