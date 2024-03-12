import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
from urllib.parse import urljoin
import json, os
import multiprocessing as mp

if __name__ == "__main__":
    BASE_URL = "https://papers.nips.cc/"
    
    