import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
from urllib.parse import urljoin
import json, os
import multiprocessing as mp

# find all links names "Main Conference"
def get_main_conference_links(url):
    base_url = '/'.join(url.split('/')[:-1])
    
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    links = soup.find_all("a")
    main_conference_links = []
    for link in links:
        if "Main Conference" in link.text:
            main_conference_links.append(link.get("href"))
            
    url = url.replace("/menu_other.html", "")
            
    main_conference_links = [base_url + "/" + link for link in main_conference_links]
    return main_conference_links

def get_all_papers_from_conference(url):
    base_url = '/'.join(url.split('/')[:-1])
    # the website can show all papers in one page
    # or a link with the text "All Papers" that will redirect to the page with all papers
    # or a link for each day of the conference
    
    response = requests.get(url, allow_redirects=True)
    soup = BeautifulSoup(response.text, "html.parser")

    # first test for the all papers link
    links = soup.find_all("a")
    for link in links:
        if "All Papers" in link.text:
            print(f"Found all papers link. Redirecting to {base_url + link.get('href')}")
            return get_all_papers_from_conference(base_url + "/" + link.get("href"))
        
        
    papers = []
    dt = soup.find_all("dt", class_="ptitle")
    if len(dt) > 0:
        print("Found papers! Getting all...")
        for d in dt:
            paper = d.find("a")
            papers.append(paper.get("href"))
    else:        
        # if there is no all papers link, then we will check if we have a link for each day
        for link in links:
            if "Day " in link.text:
                day_link = link.get("href")
                print(f"Found day link. Redirecting to {base_url + day_link}")
                day_papers = get_all_papers_from_conference(base_url + "/" + day_link)
                papers.extend(day_papers)

    return papers

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
        # <div class="bibref">
        paper_info["bibref"] = soup.find("div", class_="bibref").text
        
        # for line in bibref.split("\n"):
        for line in paper_info["bibref"].split("\n"):
            if 'booktitle' in line:
                paper_info["conference"] = line.split("{")[-1].replace("}", "")
            if 'year' in line:
                paper_info["year"] = line.split("{")[-1].replace("}", "")
        # get link that ends with 'pdf'
        links = soup.find_all("a")
        for link in links:
            if link.get("href") and link.get("href").endswith("pdf"):
                text = link.text
                link = link.get("href")
                if not link.startswith("http"):
                    link = urljoin(url, link)
                paper_info[text] = link

            elif link.get("href") and 'arxiv' in link.get("href"):
                text = link.text
                paper_info[text] = link.get("href")
                
            elif link.get("href") and 'youtube' in link.get("href"):
                text = link.text
                paper_info[text] = link.get("href")
        
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

def join_all_papers():
    all_papers = []
    for file in os.listdir("papers"):
        with open(f"papers/{file}", "r") as f:
            all_papers.append(json.load(f))
            
    with open("papers_info.json", "w") as f:
        json.dump(all_papers, f)
    return all_papers

if __name__ == "__main__":
    
    BASE_URL_EXTRA = "https://openaccess.thecvf.com/menu_other.html"
    BASE_URL_MENU = "https://openaccess.thecvf.com/menu"
    BASE_URL = "https://openaccess.thecvf.com"
    
    if os.path.exists("papers_links.json"):
        with open("papers_links.json", "r") as f:
            all_paper_pages = json.load(f)
        print(f"Found {len(all_paper_pages)} papers")
    else:
        conferences_links = []
        conferences_links.extend(get_main_conference_links(BASE_URL_EXTRA))
        conferences_links.extend(get_main_conference_links(BASE_URL_MENU))
        
        all_paper_pages = []
        conference_dict = {}
        for conference in conferences_links:
            conference_name = conference.split("/")[-1].replace(".html", "").replace(".py", "")
            print(f"Getting papers from {conference_name}... {conference}")
            papers = get_all_papers_from_conference(conference)
            print(f"Found {len(papers)} papers\n")
            all_paper_pages.extend(papers)
            conference_dict[conference_name] = papers
            
        with open("papers_links.json", "w") as f:
            json.dump(all_paper_pages, f)
            
        with open("papers_links_conferences.json", "w") as f:
            json.dump(conference_dict, f)
            
    for i, paper in enumerate(all_paper_pages):
        if not paper.startswith("http"):
            all_paper_pages[i] = urljoin(BASE_URL, paper)
    
    with mp.Pool(12) as pool:
        papers_info = list(tqdm(pool.imap(fetch_each_paper_info, all_paper_pages), total=len(all_paper_pages)))
        
    with open("papers_info.json", "w") as f:
        json.dump(papers_info, f)