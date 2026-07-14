from fastapi import APIRouter

from app.services.github import get_folder


router=APIRouter()


@router.get("/")
def papers():

    return get_folder()
