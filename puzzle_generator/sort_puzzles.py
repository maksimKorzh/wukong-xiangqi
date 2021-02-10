# script to sort Xiangqi puzzles JSON file
import json

mate_in_1 = [];
mate_in_2 = [];
mate_in_3 = [];
mate_in_4 = [];
mate_in_5 = [];
mate_in_6 = [];
mate_in_7 = [];

with open('puzzles_verified.json') as fr:
    games = json.loads(fr.read())
    
    for game in games:
        if 'Mate in 1 ' in game['title']: mate_in_1.append(game)
        elif 'Mate in 2 ' in game['title']: mate_in_2.append(game)
        elif 'Mate in 3 ' in game['title']: mate_in_3.append(game)
        elif 'Mate in 4 ' in game['title']: mate_in_4.append(game)
        elif 'Mate in 5 ' in game['title']: mate_in_5.append(game)
        elif 'Mate in 6 ' in game['title']: mate_in_6.append(game)
        elif 'Mate in 7 ' in game['title']: mate_in_7.append(game)
        elif 'Mate in 8 ' in game['title']: mate_in_5.append(game)
        
with open('puzzles_verified_sorted.json', 'w') as fr:
    sorted_games = []
    
    for game in mate_in_1: sorted_games.append(game)
    for game in mate_in_2: sorted_games.append(game)
    for game in mate_in_3: sorted_games.append(game)
    for game in mate_in_4: sorted_games.append(game)
    for game in mate_in_5: sorted_games.append(game)
    for game in mate_in_6: sorted_games.append(game)
    for game in mate_in_7: sorted_games.append(game)
    
    for index in range(0, len(sorted_games)):
        if sorted_games[index]['title'] == 'Mate in 1 move(s)':
            sorted_games[index]['title'] = 'Mate in 1 move'
        
        elif sorted_games[index]['title'] == 'Mate in 5 move(s)':
            sorted_games[index]['title'] = 'Mate in ? moves'
        
        elif sorted_games[index]['title'] == 'Mate in 6 move(s)':
            sorted_games[index]['title'] = 'Mate in ? moves'
        
        elif sorted_games[index]['title'] == 'Mate in 7 move(s)':
            sorted_games[index]['title'] = 'Mate in ? moves'
        
        elif sorted_games[index]['title'] == 'Mate in 8 move(s)':
            sorted_games[index]['title'] = 'Mate in ? moves'
            
        sorted_games[index]['title'] = sorted_games[index]['title'].replace('move(s)', 'moves')
        sorted_games[index]['id'] = 'puzzle_' + str(index)
    
    fr.write(json.dumps(sorted_games, sort_keys=True, indent=2))
