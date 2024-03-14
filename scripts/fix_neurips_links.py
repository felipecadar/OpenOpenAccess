import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
from urllib.parse import urljoin
import json, os
import multiprocessing as mp
from lxml import etree

from functools import reduce

with open('../public/papers_info.json', 'r') as f:
    papers_info = json.load(f)
    
for i in range(len(papers_info)):
    if 'NeurIPS'  in papers_info[i]:
        url = papers_info[i]['NeurIPS']
        pdf = papers_info[i]['pdf']
        
        if 'supp' in papers_info[i]:
            supp = papers_info[i]['supp']
            supp = urljoin(url, supp)
            papers_info[i]['supp'] = supp
        
        pdf = urljoin(url, pdf)
        
        papers_info[i]['pdf'] = pdf

with open('../public/papers_infov2.json', 'w') as f:
    json.dump(papers_info, f, indent=4)