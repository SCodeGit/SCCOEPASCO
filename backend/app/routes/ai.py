from fastapi import APIRouter
from pydantic import BaseModel

from app.services.mongo import papers_collection, save_paper
from app.services.pdf_extract import extract_pdf_text
from app.services.fireworks import ask_ai


router = APIRouter()


# ==============================
# REQUEST MODELS
# ==============================

class SolveRequest(BaseModel):
    pdf_url: str
    filename: str



class ChatRequest(BaseModel):
    filename: str
    question: str



# ==============================
# SOLVE FULL PAPER
# ==============================

@router.post("/solve")
def solve(data: SolveRequest):

    print("REQUESTED:", data.filename)


    # -----------------------------
    # Check Mongo first
    # -----------------------------

    paper = papers_collection.find_one(
        {
            "filename": data.filename
        }
    )


    if paper:

        print("LOADED FROM MONGO")

        text = paper.get(
            "text",
            ""
        )


    else:

        print("NOT FOUND - OCR START")


        text = extract_pdf_text(
            data.pdf_url
        )


        metadata = {

            "processed": True,

            "text_length": len(text),

            "ocr_used": True

        }


        save_paper(

            data.filename,

            data.pdf_url,

            text,

            metadata

        )



    if len(text.strip()) == 0:

        return {

            "solution":
            "No readable text found in this document."

        }



    # -----------------------------
    # Ask AI
    # -----------------------------

    prompt = f"""

You are SCode Academic AI.

Solve this College of Education examination paper.

Instructions:

- Answer all questions.
- Maintain numbering.
- For MCQ provide option and explanation.
- For theory questions provide academic answers.

EXAMINATION PAPER:

{text}

"""


    answer = ask_ai(
        prompt
    )


    return {

        "solution": answer

    }





# ==============================
# CHAT WITH PAPER
# ==============================

@router.post("/chat")
def chat(data: ChatRequest):


    print(
        "CHAT REQUEST:",
        data.filename
    )


    # Find paper from Mongo

    paper = papers_collection.find_one(
        {
            "filename": data.filename
        }
    )


    if not paper:

        return {

            "answer":
            "This paper is not indexed yet."

        }



    text = paper.get(
        "text",
        ""
    )



    if not text.strip():

        return {

            "answer":
            "No readable content exists for this paper."

        }



    # Send paper + question to AI

    prompt = f"""

You are SCode Academic AI.

A student is asking about an examination paper.

Use the paper content below to answer.

Paper:

{text}


Student Question:

{data.question}


Answer clearly and academically.

"""


    answer = ask_ai(
        prompt
    )



    return {

        "answer": answer

    }