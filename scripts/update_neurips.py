import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
from urllib.parse import urljoin
import json, os
import multiprocessing as mp
from lxml import etree

from functools import reduce


def get_papers(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    papers = [a for a in soup.find_all("a", title=True) if a["title"] == "paper title"]
    papers = [urljoin(url, a["href"]) for a in papers]

    return papers

def get_single_paper(url):
    fname = url.split("/")[-1]
    
    # check if file already exists
    if os.path.exists(f"neurips_papers/{fname}.json"):
        return
    
    # pdf xpath find <a> named Paper
    # supplemental find <a> named Supplemental 
    paper_info = {}
    
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    title = soup.select("body > div.container-fluid > div > h4:nth-child(1)")[0].text
    authors = soup.select("body > div.container-fluid > div > p:nth-child(6) > i")[0].text
    try:
        abstract = soup.select("body > div.container-fluid > div > p:nth-child(8)")[0].text
    except:
        try:
            print('Failed to get abstract at first try, trying again...')
            abstract = soup.select("body > div.container-fluid > div > p:nth-child(9)")[0].text
        except:
            print('Failed to get abstract at second try, giving up...')
            abstract = 'Failed to get abstract'
    
    paper_info = {
        "title": title,
        "authors": authors,
        "abstract": abstract,
        'url': url,
        'NeurIPS': url,
    }
    
    try:
        pdf = soup.find("a", string="Paper")["href"]
        paper_info["pdf"] = pdf
    except:
        pass
    try:
        supplemental = soup.find("a", string="Supplemental")["href"]        
        paper_info["supp"] = supplemental
    except:
        pass
    
    # save
    os.makedirs("neurips_papers/", exist_ok=True)
    with open(f"neurips_papers/{fname}.json", "w") as f:
        json.dump(paper_info, f)
    
    return 
    
if __name__ == "__main__":
    BASE_URL = "https://papers.nips.cc/"
    benchmarks_and_datasets = "https://datasets-benchmarks-proceedings.neurips.cc/paper/2021"
    
    # response = requests.get(BASE_URL)
    # soup = BeautifulSoup(response.text, "html.parser")

    # links = [urljoin(BASE_URL, a["href"]) for a in soup.find_all("a", href=True) if a["href"].startswith("/paper")]

    # # all paper links parallel
    # with mp.Pool() as pool:
    #     papers = list(tqdm(pool.imap(get_papers, links), total=len(links)))
    
    # papers = reduce(lambda x, y: x+y, papers)
    
    # # save papers to json 'neurips_paper_links.json'
    # with open("neurips_paper_links.json", "w") as f:
    #     json.dump(papers, f)
        
    # read json
    with open("neurips_paper_links.json", "r") as f:
        papers = json.load(f)
        
    # get single paper info
    with mp.Pool(16) as pool:
        list(tqdm(pool.imap(get_single_paper, papers), total=len(papers)))
        
    paper_list_for_be_and_ds = get_papers(benchmarks_and_datasets)
    with mp.Pool(16) as pool:
        list(tqdm(pool.imap(get_single_paper, paper_list_for_be_and_ds), total=len(paper_list_for_be_and_ds)))
        
    # get_single_paper("https://papers.nips.cc/paper_files/paper/2023/hash/001608167bb652337af5df0129aeaabd-Abstract-Conference.html")