import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
from urllib.parse import urljoin
import json, os
import multiprocessing as mp

def fetch_each_paper_info(url):
    if os.path.exists(f"papers/{url.split('/')[-1]}.json"):
        with open(f"papers/{url.split('/')[-1]}.json", "r") as f:
            return json.load(f)
    try:    
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")
        paper_info = {}
        paper_info['openaccess_url'] = url
        # <div id="papertitle">Dual Super-Resolution Learning for Semantic Segmentation</div>
        paper_info["title"] = soup.find("div", id="papertitle").text
        # cleanup title
        paper_info["title"] = paper_info["title"].replace("\n", "").replace("\r", "").replace("\t", "").strip()
        
        # <div id="authors"><br><b><i>Li Wang,  Dong Li,  Yousong Zhu,  Lu Tian,  Yi Shan</i></b>; Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2020, pp. 3774-3783</div>
        paper_info["authors"] = soup.find("div", id="authors").text.split(";")[0].replace("\n", "").replace("\r", "").replace("\t", "")
        # <div id="abstract">
        paper_info["abstract"] = soup.find("div", id="abstract").text

        # get link that ends with 'pdf'
        # get all links inside the div id=content
        links = soup.find("div", id="content").find_all("a")
        for link in links:
            if link.get("href") and link.text:
                text = link.text
                link = link.get("href")
                if not link.startswith("http"):
                    link = urljoin(url, link)
                    
                if text == "supplementary material":
                    text = "supp"
                paper_info[text] = link
        
        # save file
        os.makedirs("papers", exist_ok=True)
        with open(f"papers/{url.split('/')[-1]}.json", "w") as f:
            json.dump(paper_info, f)        
        
        return paper_info
    except Exception as e:
        print(f"Error with {url}: {e}")
        return {
            "openaccess_url": url,
            "error": str(e)
        }
        
if __name__ == "__main__":
    
    BASE_URL = "https://www.ecva.net/papers.php"
    
    # find all dt with ptitle class
    response = requests.get(BASE_URL)
    soup = BeautifulSoup(response.text, "html.parser")
    dt = soup.find_all("dt", class_="ptitle")
    papers = []
    for d in dt:
        paper = d.find("a")
        papers.append(urljoin(BASE_URL, paper.get("href")))
        
        
    print(f"Found {len(papers)} papers. Getting all papers...")
    
    with mp.Pool(10) as p:
        all_papers = list(tqdm(p.imap(fetch_each_paper_info, papers), total=len(papers)))
        
    print(f"Got {len(all_papers)} papers")