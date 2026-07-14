from fastapi import APIRouter
from pydantic import BaseModel

from app.services.fireworks import ask_ai


router=APIRouter()


class Question(BaseModel):
    question:str


@router.post("/solve")
def solve(data:Question):

    answer=ask_ai(data.question)

    return {
        "answer":answer
    }
