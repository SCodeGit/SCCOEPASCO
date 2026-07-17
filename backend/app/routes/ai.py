from fastapi import APIRouter
from pydantic import BaseModel

from app.services.mongo import papers_collection, save_paper
from app.services.pdf_extract import extract_pdf_text
from app.services.fireworks import ask_ai


router = APIRouter()


class SolveRequest(BaseModel):

    pdf_url: str
    filename: str



@router.post("/solve")
def solve(data: SolveRequest):


    print("REQUESTED:", data.filename)


    # -----------------------------
    # Search Mongo
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
    # Send to DeepSeek
    # -----------------------------


    prompt = f"""

You are SCode Academic AI.

Solve this College of Education examination paper.

Instructions:

- Answer all questions.
- Maintain numbering.
- For MCQ give option + explanation.
- For theory questions provide academic answers.

EXAM PAPER:

{text}

"""


    answer = ask_ai(
        prompt
    )


    return {

        "solution": answer

    }