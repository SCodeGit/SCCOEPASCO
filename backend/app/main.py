from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import ai
from app.routes import papers


app=FastAPI(
    title="SCode Academic AI"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    ai.router,
    prefix="/api/ai"
)


app.include_router(
    papers.router,
    prefix="/api/papers"
)


@app.get("/")
def home():

    return {
        "status":"SCode Academic AI Backend Running"
    }

