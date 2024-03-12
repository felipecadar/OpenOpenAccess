import json, os

if __name__ == "__main__":
    all_papers = []
    for file in os.listdir("papers"):
        with open(f"papers/{file}", "r") as f:
            all_papers.append(json.load(f))
            
    with open("papers_info.json", "w") as f:
        json.dump(all_papers, f)
