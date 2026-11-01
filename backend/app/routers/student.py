from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    User,
    UserRole,
    Lesson,
    Concept,
    MasteryState,
    MasteryStatus,
    AIRecommendation,
    StudentProgress,
    LearningEvent,
    UserAchievement,
    Achievement,
    Textbook,
)
from ..schemas import StudentDashboardResponse, ConceptNode, UserResponse
from ..adaptive_engine.bkt import calculate_aggregate_mastery
from ..adaptive_engine.recommendations import determine_next_action

router = APIRouter(prefix="/api/student", tags=["student"])


@router.get("/dashboard/{user_id}", response_model=StudentDashboardResponse)
def get_student_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != UserRole.STUDENT:
        # Fallback to demo student Ananya
        user = db.query(User).filter(User.role == UserRole.STUDENT).first()
        if not user:
            raise HTTPException(status_code=404, detail="Student not found")

    # Check for active / in-progress lesson first
    last_prog = (
        db.query(StudentProgress)
        .filter(StudentProgress.user_id == user.id)
        .order_by(StudentProgress.last_accessed_at.desc())
        .first()
    )

    if last_prog:
        lesson = db.query(Lesson).filter(Lesson.id == last_prog.lesson_id).first()
    else:
        # Default to Class 8 Mathematics Linear Equations in One Variable
        lesson = db.query(Lesson).filter(Lesson.slug.like("%linear_equation%")).first()
        if not lesson:
            lesson = db.query(Lesson).first()

    concepts = db.query(Concept).filter(Concept.chapter_id == lesson.id).order_by(Concept.order_index.asc()).all() if lesson else []

    # Calculate mastery states
    concept_nodes = []
    mastery_scores = []
    strong_count = 0
    dev_count = 0
    needs_count = 0
    first_unmastered_concept_id = None

    for c in concepts:
        m_record = (
            db.query(MasteryState)
            .filter(
                MasteryState.user_id == user.id,
                MasteryState.concept_id == c.id,
            )
            .first()
        )
        p_val = m_record.p_mastery if m_record else c.p_l0
        stat = m_record.status.value if m_record else MasteryStatus.NEEDS_SUPPORT.value

        mastery_scores.append(p_val)
        if stat == MasteryStatus.STRONG.value:
            strong_count += 1
        elif stat == MasteryStatus.DEVELOPING.value:
            dev_count += 1
        else:
            needs_count += 1

        is_gap = p_val < 0.45
        if is_gap and first_unmastered_concept_id is None:
            first_unmastered_concept_id = c.id

        concept_nodes.append(
            ConceptNode(
                id=c.id,
                code=c.code,
                title_en=c.title_en,
                title_te=c.title_te,
                title_hi=c.title_hi,
                description_en=c.description_en,
                description_te=c.description_te,
                description_hi=c.description_hi,
                order_index=c.order_index,
                difficulty=c.difficulty_level,
                p_mastery=round(p_val, 2),
                status=stat,
                is_gap=is_gap,
            )
        )

    overall_progress = calculate_aggregate_mastery(mastery_scores)

    # Next recommended action
    target_c_id = first_unmastered_concept_id or (concepts[0].id if concepts else 1)
    next_action = determine_next_action(db, user.id, target_c_id)

    # Stored AI recommendations
    recs = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.user_id == user.id, AIRecommendation.is_completed == False)
        .order_by(AIRecommendation.priority.asc())
        .all()
    )
    rec_list = [
        {
            "id": r.id,
            "type": r.recommendation_type,
            "priority": r.priority,
            "title": r.title,
            "reason": r.reason,
            "action_route": r.action_route,
        }
        for r in recs
    ]

    tb = lesson.textbook if lesson else None
    active_chapter_data = {
        "id": lesson.id if lesson else 1,
        "title": lesson.title if lesson else "Linear Equations in One Variable",
        "board": tb.board if tb else "Telangana State Board",
        "class": tb.grade_level if tb else 8,
        "subject": tb.subject if tb else "Mathematics",
        "slug": lesson.slug if lesson else "linear_equations_in_one_variable",
    }

    # Continue Learning
    continue_learning_data = None
    if last_prog and lesson:
        continue_learning_data = {
            "lesson_id": lesson.id,
            "title": lesson.title,
            "subject": tb.subject if tb else "Mathematics",
            "status": last_prog.status,
            "score_percent": last_prog.practice_score_percent,
            "content_completed": last_prog.content_completed,
            "practice_completed": last_prog.practice_completed,
            "last_accessed": last_prog.last_accessed_at.isoformat(),
            "route": f"/student/concept-map?lesson_id={lesson.id}",
        }

    # Recent activity events
    events = (
        db.query(LearningEvent)
        .filter(LearningEvent.user_id == user.id)
        .order_by(LearningEvent.created_at.desc())
        .limit(6)
        .all()
    )
    recent_activity = [
        {
            "id": e.id,
            "event_type": e.event_type,
            "created_at": e.created_at.isoformat(),
            "lesson_id": e.lesson_id,
            "concept_id": e.concept_id,
        }
        for e in events
    ]

    # Achievements
    user_achievements = (
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == user.id)
        .order_by(UserAchievement.unlocked_at.desc())
        .all()
    )
    achievements_list = [
        {
            "id": ua.achievement.id,
            "code": ua.achievement.code,
            "title": ua.achievement.title,
            "description": ua.achievement.description,
            "badge_icon": ua.achievement.badge_icon,
            "unlocked_at": ua.unlocked_at.isoformat(),
        }
        for ua in user_achievements
        if ua.achievement
    ]

    return StudentDashboardResponse(
        user=UserResponse.from_orm(user),
        active_chapter=active_chapter_data,
        chapter_progress_percent=overall_progress,
        today_recommendation=next_action,
        mastery_breakdown={
            "strong": strong_count,
            "developing": dev_count,
            "needs_support": needs_count,
        },
        recent_concepts=concept_nodes,
        all_recommendations=rec_list,
        continue_learning=continue_learning_data,
        recent_activity=recent_activity,
        achievements=achievements_list,
        subject_progress={
            "Mathematics": 78.0,
            "Physical Science": 65.0,
            "Social Studies": 82.0,
        },
    )
