import os

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from dotenv import load_dotenv


load_dotenv()


MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")


try:

    client = MongoClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=5000
    )

    # Test connection
    client.admin.command(
        "ping"
    )

    print("MongoDB connected")


except ConnectionFailure as e:

    print(
        "MongoDB connection failed:",
        e
    )

    raise



db = client[DATABASE_NAME]


papers_collection = db["papers"]



# ==============================
# CREATE INDEXES
# ==============================

papers_collection.create_index(
    "filename"
)

papers_collection.create_index(
    "path"
)



# ==============================
# FIND PAPERS
# ==============================

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



# ==============================
# SAVE PAPER
# ==============================

def save_paper(
    file,
    pdf_path,
    text,
    metadata
):

    existing = papers_collection.find_one(
        {
            "path": pdf_path
        }
    )


    if existing:

        print(
            "SKIPPED DUPLICATE:",
            file
        )

        return existing



    document = {

        "filename": file,

        "path": pdf_path,

        "text": text,

        **metadata

    }



    result = papers_collection.insert_one(
        document
    )


    document["_id"] = result.inserted_id



    print(
        "SAVED TO MONGO:",
        file
    )


    return document