import os
import json
from tqdm import tqdm

DB_PATH = 'public/papers_info.json'

DB = json.load(open(DB_PATH))

print(f'Loaded {len(DB)} papers')
abstract_max_len = 10_000

# remove duplicates by 'title'
abtract_lens = []
unique_papers = {}
for paper in tqdm(DB):
    title = paper['title'].strip().lower().replace(' ', '')
    # limt abstract length
    paper['abstract'] = paper['abstract'][:abstract_max_len]
    if title not in unique_papers:
        unique_papers[title] = paper
    else:
        # show both duplicates
        print(f"Duplicate: {title}")
        print(f"Paper 1: {unique_papers[title]['title']}")
        print(f"Paper 2: {paper['title']}")
        # check if has more keys
        if len(paper.keys()) > len(unique_papers[title].keys()):
            unique_papers[title] = paper
            print(f"Replaced: {title} with {paper.keys()} keys by {unique_papers[title].keys()} keys") 
            
new_db = list(unique_papers.values())
json.dump(new_db, open(DB_PATH, 'w'))