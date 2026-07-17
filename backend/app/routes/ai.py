from fastapi import APIRouter
from pydantic import BaseModel

from app.services.fireworks import ask_ai
from app.services.pdf import extract_pdf_text


router = APIRouter()


class PDFRequest(BaseModel):
    pdf_url: str
    filename: str


@router.post("/solve")
def solve(data: PDFRequest):

    text = extract_pdf_text(data.pdf_url)

    prompt = f"""
You are SCode Academic AI.

Analyze this examination document:

Filename:
{data.filename}

Document text:
{text}

Provide clear academic solutions.
"""

    answer = ask_ai(prompt)

    return {
        "answer": answer
    }