import os

from pymongo import MongoClient
from dotenv import load_dotenv


load_dotenv()


client = MongoClient(
    os.getenv("MONGODB_URI")
)

db = client[
    os.getenv("DATABASE_NAME")
]

papers_collection = db["papers"]


def get_paper_by_path(path):

    return papers_collection.find_one(
        {
            "path": path
        }
    )


def get_paper_by_filename(filename):

    return papers_collection.find_one(
        {
            "filename": filename
        }
    )


def save_paper(file, pdf_path, text, metadata):

    existing = papers_collection.find_one(
        {
            "path": pdf_path
        }
    )

    if existing:
        print("SKIPPED DUPLICATE:", file)
        return existing

    document = {

        "filename": file,

        "path": pdf_path,

        "text": text,

        **metadata

    }

    papers_collection.insert_one(document)

    print("SAVED TO MONGO:", file)

    return document