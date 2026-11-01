"""
Authoritative Curriculum Navigation & Discovery Router for VidyaFlow.
Implements: Select Class -> Select Board -> Select Subject -> View Textbooks -> Select Textbook -> View All Lessons.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from ..database import get_db
from ..models import Textbook, Lesson, Concept, Question, StudentProgress, User
from ..adaptive_engine.progress_manager import (
    start_or_resume_lesson,
    record_concept_opened,
    mark_content_completed,
)

router = APIRouter(prefix="/api/curriculum", tags=["curriculum"])


@router.get("/classes")
def get_available_classes(db: Session = Depends(get_db)):
    """Returns all academic classes available in dataset_textbooks."""
    grades = db.query(Textbook.grade_level).distinct().order_by(Textbook.grade_level.asc()).all()
    grade_list = [g[0] for g in grades] if grades else [6, 7, 8, 9, 10]
    return {
        "classes": grade_list,
        "default_class": 8,
    }


@router.get("/boards")
def get_available_boards(grade_level: int = Query(default=8), db: Session = Depends(get_db)):
    """Returns boards with coverage metadata."""
    return [
        {
            "id": "telangana",
            "name": "Telangana State Board (SCERT EM 2026-27)",
            "is_primary": True,
            "has_dataset_files": True,
            "description": "Authentic Telangana English Medium State Board Textbooks ingested from dataset_textbooks.",
        },
        {
            "id": "cbse",
            "name": "CBSE (NCERT)",
            "is_primary": False,
            "has_dataset_files": False,
            "description": "National CBSE Curriculum mapping supported.",
        },
        {
            "id": "icse",
            "name": "ICSE (CISCE)",
            "is_primary": False,
            "has_dataset_files": False,
            "description": "Council for the Indian School Certificate Examinations curriculum supported.",
        },
    ]


@router.get("/subjects")
def get_subjects_for_class(
    grade_level: int = Query(default=8),
    board: str = Query(default="telangana"),
    db: Session = Depends(get_db),
):
    """
    Returns authentic subjects discovered for the specified class.
    Preserves exact dataset structure:
    - Classes 6 & 7: Mathematics, General Science, Social Studies
    - Class 8: Mathematics, Physical Science, Social Studies
    - Class 9: Mathematics, Physics, Biology, Social Studies
    - Class 10: Mathematics, Social Studies (Physics/Bio missing in dataset)
    """
    textbooks = (
        db.query(Textbook)
        .filter(Textbook.grade_level == grade_level, Textbook.board == board)
        .all()
    )

    discovered_subjects = []
    seen = set()
    for tb in textbooks:
        if tb.subject not in seen:
            seen.add(tb.subject)
            lesson_count = db.query(Lesson).filter(Lesson.textbook_id == tb.id).count()
            discovered_subjects.append({
                "name": tb.subject,
                "textbook_title": tb.title,
                "textbook_id": tb.id,
                "lesson_count": lesson_count,
                "is_available": True,
            })

    # Honest reporting of missing subjects in dataset
    required_canonical = ["Mathematics", "Physics", "Biology", "Social Studies"]
    for canon in required_canonical:
        # Check if covered directly or via General Science / Physical Science
        is_covered = (
            canon in seen
            or (canon in ["Physics", "Biology"] and ("General Science" in seen or "Physical Science" in seen))
        )
        if not is_covered:
            discovered_subjects.append({
                "name": canon,
                "textbook_title": f"Class {grade_level} {canon} (Dataset PDF missing)",
                "textbook_id": None,
                "lesson_count": 0,
                "is_available": False,
                "missing_reason": f"Textbook file for Class {grade_level} {canon} is not provided in dataset_textbooks/",
            })

    return discovered_subjects


@router.get("/textbooks")
def get_textbooks(
    grade_level: int = Query(default=8),
    board: str = Query(default="telangana"),
    subject: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """Returns actual textbooks belonging to class and subject."""
    query = db.query(Textbook).filter(Textbook.grade_level == grade_level, Textbook.board == board)
    if subject:
        # Match subject or variant
        query = query.filter(Textbook.subject.ilike(f"%{subject}%"))

    textbooks = query.all()
    results = []
    for tb in textbooks:
        lessons = db.query(Lesson).filter(Lesson.textbook_id == tb.id).order_by(Lesson.chapter_number.asc()).all()
        results.append({
            "id": tb.id,
            "title": tb.title,
            "filename": tb.filename,
            "board": tb.board,
            "grade_level": tb.grade_level,
            "subject": tb.subject,
            "total_pages": tb.total_pages,
            "lesson_count": len(lessons),
        })
    return results


@router.get("/textbooks/{textbook_id}/lessons")
def get_lessons_for_textbook(
    textbook_id: int,
    user_id: int = Query(default=1),
    db: Session = Depends(get_db),
):
    """
    Returns all actual lessons for the selected textbook.
    Includes lesson overview, page range, has_mindmap, has_practice, and user's completion status.
    """
    tb = db.query(Textbook).filter(Textbook.id == textbook_id).first()
    if not tb:
        raise HTTPException(status_code=404, detail="Textbook not found")

    lessons = db.query(Lesson).filter(Lesson.textbook_id == tb.id).order_by(Lesson.chapter_number.asc()).all()

    # Get student progress records
    progress_map = {}
    progress_records = db.query(StudentProgress).filter(StudentProgress.user_id == user_id).all()
    for pr in progress_records:
        progress_map[pr.lesson_id] = pr

    results = []
    for l in lessons:
        pr = progress_map.get(l.id)
        status = pr.status if pr else "not_started"
        concepts_count = db.query(Concept).filter(Concept.chapter_id == l.id).count()
        questions_count = db.query(Question).filter(Question.chapter_id == l.id).count()

        results.append({
            "id": l.id,
            "chapter_number": l.chapter_number,
            "title": l.title,
            "slug": l.slug,
            "page_start": l.page_start,
            "page_end": l.page_end,
            "pages_display": f"Pages {l.page_start}–{l.page_end}",
            "overview": l.overview,
            "has_mindmap": l.has_mindmap or (concepts_count > 0),
            "has_practice": l.has_practice or (questions_count > 0),
            "concepts_count": concepts_count,
            "questions_count": questions_count,
            "status": status,
            "content_completed": pr.content_completed if pr else False,
            "practice_completed": pr.practice_completed if pr else False,
            "score_percent": pr.practice_score_percent if pr else 0.0,
        })

    return {
        "textbook": {
            "id": tb.id,
            "title": tb.title,
            "filename": tb.filename,
            "grade_level": tb.grade_level,
            "subject": tb.subject,
            "board": tb.board,
        },
        "lessons": results,
    }


@router.get("/lesson/{lesson_id}")
def get_lesson_detail(
    lesson_id: int,
    user_id: int = Query(default=1),
    db: Session = Depends(get_db),
):
    """
    Returns full lesson overview and primary concept mind map metadata.
    Fulfills Section 2: Interactive Mind Map First.
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    tb = lesson.textbook
    concepts = db.query(Concept).filter(Concept.chapter_id == lesson.id).order_by(Concept.order_index.asc()).all()
    questions = db.query(Question).filter(Question.chapter_id == lesson.id).all()

    progress = (
        db.query(StudentProgress)
        .filter(StudentProgress.user_id == user_id, StudentProgress.lesson_id == lesson.id)
        .first()
    )

    return {
        "lesson": {
            "id": lesson.id,
            "chapter_number": lesson.chapter_number,
            "title": lesson.title,
            "slug": lesson.slug,
            "page_start": lesson.page_start,
            "page_end": lesson.page_end,
            "overview": lesson.overview,
            "has_mindmap": len(concepts) > 0,
            "has_practice": len(questions) > 0,
            "concepts_count": len(concepts),
            "questions_count": len(questions),
            "summary_en": lesson.summary_en,
            "summary_te": lesson.summary_te,
            "summary_hi": lesson.summary_hi,
        },
        "textbook": {
            "id": tb.id,
            "title": tb.title,
            "grade_level": tb.grade_level,
            "subject": tb.subject,
            "board": tb.board,
        },
        "progress": {
            "status": progress.status if progress else "not_started",
            "content_completed": progress.content_completed if progress else False,
            "practice_completed": progress.practice_completed if progress else False,
            "score_percent": progress.practice_score_percent if progress else 0.0,
            "started_at": progress.started_at.isoformat() if progress and progress.started_at else None,
            "completed_at": progress.completed_at.isoformat() if progress and progress.completed_at else None,
        },
    }


@router.post("/lesson/{lesson_id}/start")
def start_lesson_endpoint(
    lesson_id: int,
    user_id: int = Query(default=1),
    db: Session = Depends(get_db),
):
    """
    Section 6: Explicit Lesson Start.
    Opening/starting a lesson must NOT mark it completed!
    Marks status as 'in_progress' and records 'lesson_started' event.
    """
    progress = start_or_resume_lesson(db, user_id, lesson_id)
    return {
        "status": "success",
        "lesson_id": lesson_id,
        "progress_status": progress.status,
        "started_at": progress.started_at.isoformat(),
        "last_accessed_at": progress.last_accessed_at.isoformat(),
        "is_completed": progress.status == "completed",
    }


@router.post("/lesson/{lesson_id}/concept/{concept_id}/view")
def view_concept_endpoint(
    lesson_id: int,
    concept_id: int,
    user_id: int = Query(default=1),
    db: Session = Depends(get_db),
):
    """Section 3 & 5: Records concept exploration from mind map."""
    result = record_concept_opened(db, user_id, lesson_id, concept_id)
    return result


@router.post("/lesson/{lesson_id}/complete-content")
def complete_content_endpoint(
    lesson_id: int,
    user_id: int = Query(default=1),
    db: Session = Depends(get_db),
):
    """Section 6: Marks lesson mind map and reading content completed."""
    progress = mark_content_completed(db, user_id, lesson_id)
    return {
        "status": "success",
        "content_completed": progress.content_completed,
        "is_completed": progress.status == "completed",
    }


@router.get("/inventory")
def get_curriculum_inventory(db: Session = Depends(get_db)):
    """
    Generates the complete honest curriculum coverage report for Classes 6–10.
    """
    textbooks = db.query(Textbook).order_by(Textbook.grade_level.asc(), Textbook.subject.asc()).all()

    report = []
    total_lessons = 0
    total_with_mindmaps = 0
    total_with_practice = 0

    for tb in textbooks:
        lessons = db.query(Lesson).filter(Lesson.textbook_id == tb.id).all()
        mindmap_count = sum(1 for l in lessons if l.has_mindmap or db.query(Concept).filter(Concept.chapter_id == l.id).count() > 0)
        practice_count = sum(1 for l in lessons if l.has_practice or db.query(Question).filter(Question.chapter_id == l.id).count() > 0)

        total_lessons += len(lessons)
        total_with_mindmaps += mindmap_count
        total_with_practice += practice_count

        report.append({
            "class": tb.grade_level,
            "subject": tb.subject,
            "textbook": tb.title,
            "filename": tb.filename,
            "lessons_count": len(lessons),
            "mindmap_ready_lessons": mindmap_count,
            "practice_ready_lessons": practice_count,
        })

    return {
        "total_textbooks": len(textbooks),
        "total_lessons": total_lessons,
        "total_mindmaps_ready": total_with_mindmaps,
        "total_practice_ready": total_with_practice,
        "breakdown": report,
        "missing_dataset_files": [
            {"class": 8, "subject": "Biology", "note": "Class 8 Biology PDF not present in dataset_textbooks/"},
            {"class": 10, "subject": "Physics", "note": "Class 10 Physical Science PDF not present in dataset_textbooks/"},
            {"class": 10, "subject": "Biology", "note": "Class 10 Biology PDF not present in dataset_textbooks/"},
        ],
    }
