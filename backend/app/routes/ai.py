from fastapi import APIRouter
from pydantic import BaseModel

from app.services.fireworks import ask_ai
from app.services.pdf_extract import extract_pdf_text


router = APIRouter()


class PDFRequest(BaseModel):
    pdf_url: str
    filename: str


@router.post("/solve")
def solve(data: PDFRequest):

    text = extract_pdf_text(data.pdf_url)

    prompt = f"""
You are SCode Academic AI.

Analyze this academic document:

Filename:
{data.filename}

Content:
{text}

Provide clear solutions and explanations for the questions.
"""

    answer = ask_ai(prompt)

    return {
        "answer": answer
    }