import os
import requests
from dotenv import load_dotenv


load_dotenv()


OWNER=os.getenv("GITHUB_OWNER")
REPO=os.getenv("GITHUB_REPO")
BRANCH=os.getenv("GITHUB_BRANCH")


def get_folder(path=""):

    url=f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}?ref={BRANCH}"

    response=requests.get(url)

    return response.json()
