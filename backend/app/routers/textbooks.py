import json
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Chapter
from ..schemas import ChapterSummaryResponse
from ..dataset_parser.parser import run_ingestion_pipeline

router = APIRouter(prefix="/api/textbooks", tags=["textbooks"])


@router.get("/chapters")
def get_all_chapters(db: Session = Depends(get_db)):
    chapters = db.query(Chapter).order_by(Chapter.chapter_number.asc()).all()
    return [
        {
            "id": ch.id,
            "title": ch.title,
            "slug": ch.slug,
            "chapter_number": ch.chapter_number,
            "board": ch.board,
            "grade_level": ch.grade_level,
            "subject": ch.subject,
        }
        for ch in chapters
    ]


@router.get("/summary/{chapter_id}", response_model=ChapterSummaryResponse)
def get_chapter_summary(chapter_id: int, db: Session = Depends(get_db)):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        chapter = db.query(Chapter).first()
        if not chapter:
            raise HTTPException(status_code=404, detail="Chapter not found")

    try:
        formulas = json.loads(chapter.formulas_json) if chapter.formulas_json else []
    except Exception:
        formulas = []

    try:
        definitions = json.loads(chapter.definitions_json) if chapter.definitions_json else []
    except Exception:
        definitions = []

    try:
        flashcards = json.loads(chapter.flashcards_json) if chapter.flashcards_json else []
    except Exception:
        flashcards = []

    board = chapter.textbook.board if chapter.textbook else "Telangana State Board"
    grade_level = chapter.textbook.grade_level if chapter.textbook else 8

    return ChapterSummaryResponse(
        id=chapter.id,
        title=chapter.title,
        chapter_number=chapter.chapter_number,
        board=board,
        grade_level=grade_level,
        summary_en=chapter.summary_en,
        summary_te=chapter.summary_te,
        summary_hi=chapter.summary_hi,
        formulas=formulas,
        definitions=definitions,
        flashcards=flashcards,
    )


@router.post("/reingest")
def trigger_dataset_reingestion(background_tasks: BackgroundTasks):
    """Triggers dataset ingestion from dataset_textbooks directory."""
    background_tasks.add_task(run_ingestion_pipeline)
    return {
        "status": "triggered",
        "message": "Textbook parsing and concept hierarchy extraction pipeline initiated.",
    }
