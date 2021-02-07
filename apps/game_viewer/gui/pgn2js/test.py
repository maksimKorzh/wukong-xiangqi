#
# Script to convert PGN to JS object
#

import json
json_games = []
count = 0

with open('games.pgn') as f:
    games = f.read()
    current_game = {'id': 0}
    
    for game in games.split('\n\n'):
        try:
            if game[0] == '[':
                count += 1
                current_game['id'] = count
                current_game['event'] = game.split('[Event "')[-1].split('"')[0]
                current_game['red'] = game.split('[Red "')[-1].split('"')[0]
                current_game['black'] = game.split('[Black "')[-1].split('"')[0]
            
            elif game[0] == '1':
                current_game['moves'] = ' '.join([move for move in game.split() if len(move) > 3])
            
                json_games.append({
                    'id': current_game['id'],
                    'event': current_game['event'],
                    'red': current_game['red'],
                    'black': current_game['black'],
                    'moves': current_game['moves']
                })
        
        except: pass

with open('games.js', 'w') as f:
    f.write('const Games = ' + json.dumps(json_games, indent=2) + ';')
            
