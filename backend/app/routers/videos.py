import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import (
    LearningVideo,
    StudentVideoProgress,
    User,
    Lesson,
    StudentProgress,
)
from ..schemas import (
    VideoResourceResponse,
    VideoCompleteRequest,
    VideoCompleteResponse,
    VideoProgressSummaryResponse,
)
from ..adaptive_engine.progress_manager import (
    record_learning_event,
    start_or_resume_lesson,
)

router = APIRouter(prefix="/api/videos", tags=["videos"])


def _format_video_response(
    v: LearningVideo,
    is_completed: bool = False,
    completed_at: Optional[datetime] = None,
    language: str = "en",
) -> Dict[str, Any]:
    """Helper to convert model to response dict with localization support."""
    # Localize title and description if requested and available
    title = v.title
    description = v.description
    if language == "te" and v.title_te:
        title = v.title_te
    elif language == "hi" and v.title_hi:
        title = v.title_hi

    if language == "te" and v.description_te:
        description = v.description_te
    elif language == "hi" and v.description_hi:
        description = v.description_hi

    tags = []
    if v.tags_json:
        try:
            tags = json.loads(v.tags_json)
        except Exception:
            tags = []

    related_concepts = []
    if v.related_concepts_json:
        try:
            related_concepts = json.loads(v.related_concepts_json)
        except Exception:
            related_concepts = []

    key_takeaways = []
    if v.key_takeaways_json:
        try:
            key_takeaways = json.loads(v.key_takeaways_json)
        except Exception:
            key_takeaways = []

    return {
        "id": v.id,
        "title": title,
        "title_te": v.title_te,
        "title_hi": v.title_hi,
        "description": description,
        "description_te": v.description_te,
        "description_hi": v.description_hi,
        "board": v.board,
        "grade_level": v.grade_level,
        "subject": v.subject,
        "chapter": v.chapter,
        "chapter_id": v.chapter_id,
        "topic": v.topic,
        "video_url": v.video_url,
        "thumbnail_url": v.thumbnail_url,
        "duration": v.duration,
        "language": v.language,
        "difficulty": v.difficulty,
        "tags": tags,
        "resource_type": v.resource_type,
        "is_mock": v.is_mock,
        "related_concepts": related_concepts,
        "key_takeaways": key_takeaways,
        "order_index": v.order_index,
        "is_completed": is_completed,
        "completed_at": completed_at.strftime("%Y-%m-%d %H:%M:%S") if completed_at else None,
    }


@router.get("", response_model=List[VideoResourceResponse])
def get_videos(
    grade_level: int = Query(8, description="Class grade level (6-10)"),
    subject: str = Query("Mathematics", description="Subject name"),
    board: Optional[str] = Query(None, description="Board name filter"),
    subtopic: Optional[str] = Query(None, description="Filter by subtopic"),
    difficulty: Optional[str] = Query(None, description="Beginner | Intermediate | Advanced"),
    search: Optional[str] = Query(None, description="Keyword search in title, topic, description"),
    language: str = Query("en", description="en | te | hi"),
    user_id: Optional[int] = Query(1, description="Student user ID to check completion"),
    db: Session = Depends(get_db),
):
    """
    List learning video resources with rich multi-filter support and student completion status.
    """
    query = db.query(LearningVideo).filter(
        LearningVideo.grade_level == grade_level,
        LearningVideo.subject.ilike(f"%{subject.strip()}%"),
    )

    if board:
        query = query.filter(LearningVideo.board.ilike(f"%{board.strip()}%"))

    if subtopic and subtopic.strip() and subtopic.lower() != "all":
        query = query.filter(LearningVideo.topic.ilike(f"%{subtopic.strip()}%"))

    if difficulty and difficulty.strip() and difficulty.lower() != "all":
        query = query.filter(LearningVideo.difficulty.ilike(difficulty.strip()))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                LearningVideo.title.ilike(term),
                LearningVideo.topic.ilike(term),
                LearningVideo.description.ilike(term),
                LearningVideo.tags_json.ilike(term),
            )
        )

    videos = query.order_by(LearningVideo.order_index.asc()).all()

    # Fetch user completion map if user_id provided
    completion_map: Dict[int, Optional[datetime]] = {}
    if user_id:
        progress_rows = (
            db.query(StudentVideoProgress)
            .filter(
                StudentVideoProgress.user_id == user_id,
                StudentVideoProgress.completed == True,
            )
            .all()
        )
        for p in progress_rows:
            completion_map[p.video_id] = p.completed_at

    results = []
    for v in videos:
        is_comp = v.id in completion_map
        comp_at = completion_map.get(v.id)
        results.append(_format_video_response(v, is_comp, comp_at, language))

    return results


@router.get("/subtopics/list")
def get_subtopics_list(
    grade_level: int = 8,
    subject: str = "Mathematics",
    db: Session = Depends(get_db),
):
    """Return distinct subtopics for filter dropdown."""
    topics = (
        db.query(LearningVideo.topic)
        .filter(LearningVideo.grade_level == grade_level, LearningVideo.subject == subject)
        .order_by(LearningVideo.order_index.asc())
        .distinct()
        .all()
    )
    return {"subtopics": [t[0] for t in topics]}


@router.get("/progress/summary", response_model=VideoProgressSummaryResponse)
def get_video_progress_summary(
    user_id: int = Query(1, description="Student user ID"),
    grade_level: int = Query(8),
    subject: str = Query("Mathematics"),
    db: Session = Depends(get_db),
):
    """
    Returns high-level video completion statistics for the student dashboard.
    """
    total_videos = (
        db.query(LearningVideo)
        .filter(LearningVideo.grade_level == grade_level, LearningVideo.subject == subject)
        .count()
    )

    completed_records = (
        db.query(StudentVideoProgress)
        .join(LearningVideo, StudentVideoProgress.video_id == LearningVideo.id)
        .filter(
            StudentVideoProgress.user_id == user_id,
            StudentVideoProgress.completed == True,
            LearningVideo.grade_level == grade_level,
            LearningVideo.subject == subject,
        )
        .all()
    )

    completed_ids = {p.video_id for p in completed_records}
    completed_count = len(completed_ids)

    percent = round((completed_count / total_videos * 100.0), 1) if total_videos > 0 else 0.0

    # Difficulty stats
    diff_stats: Dict[str, Dict[str, int]] = {
        "Beginner": {"total": 0, "completed": 0},
        "Intermediate": {"total": 0, "completed": 0},
        "Advanced": {"total": 0, "completed": 0},
    }

    all_videos = (
        db.query(LearningVideo)
        .filter(LearningVideo.grade_level == grade_level, LearningVideo.subject == subject)
        .all()
    )

    distinct_topics = set()
    covered_topics = set()

    for v in all_videos:
        distinct_topics.add(v.topic)
        diff = v.difficulty.capitalize()
        if diff in diff_stats:
            diff_stats[diff]["total"] += 1
            if v.id in completed_ids:
                diff_stats[diff]["completed"] += 1
                covered_topics.add(v.topic)

    return VideoProgressSummaryResponse(
        user_id=user_id,
        total_videos=total_videos,
        completed_videos=completed_count,
        completion_percentage=percent,
        subtopics_covered=len(covered_topics),
        total_subtopics=len(distinct_topics),
        by_difficulty=diff_stats,
    )


@router.get("/{video_id}")
def get_video_detail(
    video_id: int,
    user_id: Optional[int] = Query(1),
    language: str = Query("en"),
    db: Session = Depends(get_db),
):
    """
    Get detailed information about a single video, including related videos
    and completion status.
    """
    video = db.query(LearningVideo).filter(LearningVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video resource not found")

    is_completed = False
    completed_at = None
    if user_id:
        prog = (
            db.query(StudentVideoProgress)
            .filter(
                StudentVideoProgress.user_id == user_id,
                StudentVideoProgress.video_id == video.id,
            )
            .first()
        )
        if prog and prog.completed:
            is_completed = True
            completed_at = prog.completed_at

    video_data = _format_video_response(video, is_completed, completed_at, language)

    # Fetch other related videos in the sequence
    related = (
        db.query(LearningVideo)
        .filter(
            LearningVideo.grade_level == video.grade_level,
            LearningVideo.subject == video.subject,
            LearningVideo.id != video.id,
        )
        .order_by(LearningVideo.order_index.asc())
        .limit(6)
        .all()
    )

    # Check completion for related
    related_completed_set = set()
    if user_id:
        related_ids = [r.id for r in related]
        comps = (
            db.query(StudentVideoProgress.video_id)
            .filter(
                StudentVideoProgress.user_id == user_id,
                StudentVideoProgress.video_id.in_(related_ids),
                StudentVideoProgress.completed == True,
            )
            .all()
        )
        related_completed_set = {c[0] for c in comps}

    video_data["related_videos"] = [
        _format_video_response(r, r.id in related_completed_set, None, language)
        for r in related
    ]

    return video_data


@router.post("/{video_id}/complete", response_model=VideoCompleteResponse)
def mark_video_completed(
    video_id: int,
    payload: VideoCompleteRequest,
    db: Session = Depends(get_db),
):
    """
    Marks a video as completed for a student.
    - Idempotent: avoids duplicate completion records.
    - Connects directly to the student progress system, recording an authoritative
      LearningEvent and updating lesson progress.
    """
    video = db.query(LearningVideo).filter(LearningVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video resource not found")

    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check for existing completion record
    existing_prog = (
        db.query(StudentVideoProgress)
        .filter(
            StudentVideoProgress.user_id == payload.user_id,
            StudentVideoProgress.video_id == video.id,
        )
        .first()
    )

    now = datetime.utcnow()

    if existing_prog and existing_prog.completed:
        # Already completed: do not duplicate
        total_in_ch = db.query(LearningVideo).filter(LearningVideo.grade_level == video.grade_level, LearningVideo.subject == video.subject).count()
        comp_in_ch = (
            db.query(StudentVideoProgress)
            .join(LearningVideo, StudentVideoProgress.video_id == LearningVideo.id)
            .filter(
                StudentVideoProgress.user_id == payload.user_id,
                StudentVideoProgress.completed == True,
                LearningVideo.grade_level == video.grade_level,
                LearningVideo.subject == video.subject,
            )
            .count()
        )
        return VideoCompleteResponse(
            success=True,
            video_id=video.id,
            user_id=payload.user_id,
            chapter_id=video.chapter_id,
            completed=True,
            completed_at=existing_prog.completed_at.strftime("%Y-%m-%d %H:%M:%S") if existing_prog.completed_at else now.strftime("%Y-%m-%d %H:%M:%S"),
            message="Video was already marked completed.",
            total_completed_in_chapter=comp_in_ch,
            total_videos_in_chapter=total_in_ch,
        )

    if existing_prog:
        existing_prog.completed = True
        existing_prog.completed_at = now
        existing_prog.watch_time_seconds = payload.watch_time_seconds or existing_prog.watch_time_seconds
    else:
        new_prog = StudentVideoProgress(
            user_id=payload.user_id,
            video_id=video.id,
            chapter_id=video.chapter_id,
            completed=True,
            completed_at=now,
            watch_time_seconds=payload.watch_time_seconds or 0,
        )
        db.add(new_prog)

    # 1. Authoritative audit event
    record_learning_event(
        db=db,
        user_id=payload.user_id,
        event_type="video_completed",
        lesson_id=video.chapter_id,
        payload={
            "video_id": video.id,
            "title": video.title,
            "topic": video.topic,
            "is_mock": video.is_mock,
            "duration": video.duration,
            "difficulty": video.difficulty,
        },
        idempotency_key=f"video_comp_{payload.user_id}_{video.id}",
    )

    # 2. Update lesson student progress if chapter_id is linked
    if video.chapter_id:
        lesson_prog = start_or_resume_lesson(db, payload.user_id, video.chapter_id)
        lesson_prog.concepts_viewed_count = (lesson_prog.concepts_viewed_count or 0) + 1
        lesson_prog.last_accessed_at = now

    db.commit()

    total_in_ch = db.query(LearningVideo).filter(LearningVideo.grade_level == video.grade_level, LearningVideo.subject == video.subject).count()
    comp_in_ch = (
        db.query(StudentVideoProgress)
        .join(LearningVideo, StudentVideoProgress.video_id == LearningVideo.id)
        .filter(
            StudentVideoProgress.user_id == payload.user_id,
            StudentVideoProgress.completed == True,
            LearningVideo.grade_level == video.grade_level,
            LearningVideo.subject == video.subject,
        )
        .count()
    )

    return VideoCompleteResponse(
        success=True,
        video_id=video.id,
        user_id=payload.user_id,
        chapter_id=video.chapter_id,
        completed=True,
        completed_at=now.strftime("%Y-%m-%d %H:%M:%S"),
        message="Video marked as completed! Progress successfully updated.",
        total_completed_in_chapter=comp_in_ch,
        total_videos_in_chapter=total_in_ch,
    )
