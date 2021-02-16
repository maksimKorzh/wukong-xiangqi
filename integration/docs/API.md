# API documentation for Wukong Xiangqi
Open the browser's developer tools and type below commands for testing.

# Public API
```js
// version
VERSION: VERSION,

// initial position
START_FEN: START_FEN,

// side to move
COLOR: {
  RED: RED,
  BLACK: BLACK,
  NO_COLOR: NO_COLOR
},

// perft
perft: function(depth) { perftTest(depth); },

// board methods
squareToString: function(square) { return COORDINATES[square]; },
printBoard: function() { printBoard(); },
setBoard: function(fen) { setBoard(fen); },
generateFen: function() { return generateFen(); },
getPiece: function(square) { return board[square]; },
getSide: function() { return side; },
getSixty: function() { return sixty; },
resetSearchPly: function() { searchPly = 0; },
generateLegalMoves: function() { return generateLegalMoves(); },
isRepetition: function() { return isRepetition(); },
inCheck: function(color) { return isSquareAttacked(kingSquare[color], color ^ 1); },

// move manipulation
moveStack: function () { return moveStack; },
moveFromString: function(moveString) { return moveFromString(moveString); },
moveToString: function(move) { return moveToString(move); },
getSourceSquare: function(move) { return getSourceSquare(move); },
getTargetSquare: function(move) { return getTargetSquare(move); },
getCaptureFlag: function(move) { return getCaptureFlag(move); },
moveStack: function() { return moveStack; },
loadMoves: function(moves) { loadMoves(moves); },
getMoves: function() { return getMoves(); },
printMoveList: function(moveList) { printMoveList(moveList); },
makeMove: function(move) { makeMove(move)},
takeBack: function() { takeBack(); },

// timing
resetTimeControl: function() { resetTimeControl(); },
setTimeControl: function(timeControl) { setTimeControl(timeControl); },
getTimeControl: function() { return JSON.parse(JSON.stringify(timing))},
search: function(depth) { return searchPosition(depth) },

// uci
setHashSize: function(Mb) { setHashSize(Mb); },
initHashTable: function() { initHashTable(); },

// debug engine
debug: function() { debug(); }
```

# Create engine instance
```js
const engine = new Engine();
```

# Get starting position FEN string
```js
console.log(engine.START_FEN);

/*
    Output:
    
    rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1
*/
```

# Set internal engine's board from FEN string
```js
engine.setBoard('rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1');
```

# Print internal engine's board to console
```js
engine.printBoard();

/*
    Output:
    
    9  r n b a k a b n r 
    8  . . . . . . . . . 
    7  . c . . . . . c . 
    6  p . p . p . p . p 
    5  . . . . . . . . . 
    4  . . . . . . . . . 
    3  P . P . P . P . P 
    2  . C . . C . . . . 
    1  . . . . . . . . . 
    0  R N B A K A B N R 

       a b c d e f g h i

       side:           b
       sixty:          1
       hash key:      933423953
       king squares:  [e0, e9]
*/

```

# Fixed depth search
```js
let bestMove = engine.search(7);
console.log('Encoded move returned by engine.search():', bestMove);

/*
    Output:
    
    info score cp 12 depth 1 nodes 137 time 26 pv b0c2 
    info score cp 0 depth 2 nodes 1321 time 86 pv b0c2 b9c7 
    info score cp 12 depth 3 nodes 7497 time 234 pv b0c2 b9c7 h0g2 
    info score cp 0 depth 4 nodes 23744 time 342 pv h2c2 b7c7 c2c6 c7c3 
    info score cp 12 depth 5 nodes 45911 time 454 pv h2c2 b7c7 h0g2 h9g7 i0h0 
    info score cp 0 depth 6 nodes 221513 time 1131 pv h2e2 h9g7 b2c2 b7e7 h0g2 b9a7 
    info score cp 10 depth 7 nodes 355198 time 1675 pv h2e2 h9g7 b2c2 b7e7 h0g2 h7h3 g3g4 h3c3 c2c6 
    bestmove h2e2
    Encoded move returned by engine.search(): 354411
*/
```

# Make move on internal engine's board
```js
engine.makeMove(bestMove); // bestMove is integer type, e.g. 354411 which means "h2e2"
engine.printBoard();

/*
    Output:
    
    9  r n b a k a b n r 
    8  . . . . . . . . . 
    7  . c . . . . . c . 
    6  p . p . p . p . p 
    5  . . . . . . . . . 
    4  . . . . . . . . . 
    3  P . P . P . P . P 
    2  . C . . C . . . . 
    1  . . . . . . . . . 
    0  R N B A K A B N R 

       a b c d e f g h i

       side:           b
       sixty:          1
       hash key:      933423953
       king squares:  [e0, e9]
*/
```

# Generate FEN string from internal engine's board
```js
let fen = engine.generateFen();
console.log('Output FEN:', fen);

/*
    Output:
    
    Output FEN: rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C4/9/RNBAKABNR b - - 0 1
*/
```
  
  
  
  


