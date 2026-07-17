from fastapi import APIRouter
from pydantic import BaseModel

from app.services.mongo import papers_collection, save_paper
from app.services.pdf_extract import extract_pdf_text
from app.services.ai_service import ask_ai


router = APIRouter()


class SolveRequest(BaseModel):
    pdf_url: str
    filename: str


@router.post("/solve")
def solve(data: SolveRequest):

    # -----------------------------
    # Check Mongo first
    # -----------------------------

    paper = papers_collection.find_one(
        {
            "filename": data.filename
        }
    )

    if paper:

        print("Loaded from Mongo")

        text = paper["text"]

    else:

        print("Extracting PDF...")

        text = extract_pdf_text(data.pdf_url)

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

    # -----------------------------
    # Ask AI
    # -----------------------------

    prompt = f"""
You are SCode Academic AI.

Below is a past examination paper.

Answer every question clearly.

If it is multiple choice,
provide the correct option and explain why.

Paper:

{text}
"""

    answer = ask_ai(prompt)

    return {
        "solution": answer
    }