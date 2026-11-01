import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .dataset_parser.parser import run_ingestion_pipeline

from .routers.auth import router as auth_router
from .routers.student import router as student_router
from .routers.teacher import router as teacher_router
from .routers.parent import router as parent_router
from .routers.mindmap import router as mindmap_router
from .routers.quiz import router as quiz_router
from .routers.chatbot import router as chatbot_router
from .routers.textbooks import router as textbooks_router
from .routers.curriculum import router as curriculum_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Prime database and parse dataset_textbooks on startup
    print("[VidyaFlow] Starting engine, creating tables & ingesting curriculum...")
    run_ingestion_pipeline()
    yield
    print("[VidyaFlow] Backend shutting down.")


app = FastAPI(
    title="VidyaFlow Adaptive Learning API",
    description="Backend engine with Bayesian Knowledge Tracing, Concept Prerequisite Graphs, and Multilingual AI Tutoring for Classes 6-10.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(student_router)
app.include_router(teacher_router)
app.include_router(parent_router)
app.include_router(mindmap_router)
app.include_router(quiz_router)
app.include_router(chatbot_router)
app.include_router(textbooks_router)
app.include_router(curriculum_router)


@app.get("/")
def health_check():
    return {
        "app": "VidyaFlow",
        "status": "online",
        "version": "1.0.0",
        "syllabi_supported": ["Telangana State Board", "CBSE", "ICSE"],
        "languages": ["English", "Telugu (తెలుగు)", "Hindi (हिन्दी)"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
