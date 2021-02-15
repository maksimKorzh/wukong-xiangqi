# Board representation
 - 11x14 array based board representation
 - 32-bit Zobrizt hashing

# Move generator
 - on the fly attacks
 - incremental updates of position on make move/take back
 - move stack for storing board state variables

# Evaluation
 - material weights from Yen et al. 2004, "Computer Chinese Chess" ICGA Journal
 - PST values from Li, Cuanqi 2008, "Using AdaBoost to Implement Chinese Chess Evaluation Functions", UCLA thesis
 
# Search
 - 60 move rule detection
 - 3 fold repetition detection
 - stand pat quiescence
 - on the fly move sorting
 - MVV_LVA/killer/history/PV move ordering
 - Evaluation pruning
 - NMP (Null move pruning)
 - Razoring
 - Futility pruning
 - LMR (Late move reduction)
 - PVS (Principal variation search)
 
 # Interfaces
 - Web browser
 - UCI Cyclone protocol (works with Xboard/Winboard via uci2wb adapter)
 
 # GUI
 - play/edit modes
 - force move/self play
 - unlimited undo moves
 - flip board
 - difficulty levels
 - highlight legal moves
 - board & piece themes
 - board sounds
 - PGN download (UCI move format, might be opened in Xboard/Winboard)
 
 
 
