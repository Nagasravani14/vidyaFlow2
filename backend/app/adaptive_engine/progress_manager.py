"""
Authoritative Event-Driven Progress, Mastery & Achievement Manager for VidyaFlow.
Implements Sections 5, 6, and 7 of the specification.
"""

import json
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.orm import Session
from ..models import (
    User,
    Lesson,
    Concept,
    MasteryState,
    MasteryStatus,
    StudentProgress,
    LearningEvent,
    Achievement,
    UserAchievement,
    AssessmentAttempt,
    Question,
)
from .bkt import update_bkt_mastery


def record_learning_event(
    db: Session,
    user_id: int,
    event_type: str,
    lesson_id: Optional[int] = None,
    concept_id: Optional[int] = None,
    payload: Optional[Dict[str, Any]] = None,
    idempotency_key: Optional[str] = None,
) -> LearningEvent:
    """Logs an immutable learning event to the audit stream."""
    if idempotency_key:
        existing = db.query(LearningEvent).filter(LearningEvent.idempotency_key == idempotency_key).first()
        if existing:
            return existing

    event = LearningEvent(
        user_id=user_id,
        lesson_id=lesson_id,
        concept_id=concept_id,
        event_type=event_type,
        idempotency_key=idempotency_key,
        event_payload_json=json.dumps(payload or {}),
        created_at=datetime.utcnow(),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def start_or_resume_lesson(
    db: Session,
    user_id: int,
    lesson_id: int,
) -> StudentProgress:
    """
    Called when a student selects or opens a lesson.
    RULE: Opening a lesson must NOT mark it completed!
    Marks as 'in_progress', updates last_accessed_at, and logs 'lesson_started'.
    """
    progress = (
        db.query(StudentProgress)
        .filter(
            StudentProgress.user_id == user_id,
            StudentProgress.lesson_id == lesson_id,
        )
        .first()
    )

    now = datetime.utcnow()

    if not progress:
        progress = StudentProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            started_at=now,
            last_accessed_at=now,
            status="in_progress",
            content_completed=False,
            practice_completed=False,
            completion_criteria="content_and_practice_v1",
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)

        # Log event
        record_learning_event(db, user_id, "lesson_started", lesson_id=lesson_id)
        # Check First Lesson Achievement
        check_and_unlock_achievement(db, user_id, "first_lesson_started")
    else:
        # Resume without overwriting completed state or duplicating records
        progress.last_accessed_at = now
        db.commit()
        record_learning_event(db, user_id, "lesson_resumed", lesson_id=lesson_id)

    return progress


def record_concept_opened(
    db: Session,
    user_id: int,
    lesson_id: int,
    concept_id: int,
) -> Dict[str, Any]:
    """Records concept exploration from the mind map and tracks curiosity."""
    progress = start_or_resume_lesson(db, user_id, lesson_id)
    progress.concepts_viewed_count = (progress.concepts_viewed_count or 0) + 1
    db.commit()

    record_learning_event(
        db,
        user_id,
        "concept_opened",
        lesson_id=lesson_id,
        concept_id=concept_id,
    )

    # Check Concept Explorer achievement
    distinct_concepts = (
        db.query(LearningEvent.concept_id)
        .filter(
            LearningEvent.user_id == user_id,
            LearningEvent.event_type == "concept_opened",
        )
        .distinct()
        .count()
    )
    if distinct_concepts >= 3:
        check_and_unlock_achievement(db, user_id, "concept_explorer")

    return {
        "status": "success",
        "concepts_viewed_count": progress.concepts_viewed_count,
        "total_concepts_explored": distinct_concepts,
    }


def mark_content_completed(
    db: Session,
    user_id: int,
    lesson_id: int,
) -> StudentProgress:
    """Marks the interactive reading/mindmap exploration content as completed."""
    progress = start_or_resume_lesson(db, user_id, lesson_id)
    progress.content_completed = True
    db.commit()

    record_learning_event(db, user_id, "content_completed", lesson_id=lesson_id)
    evaluate_lesson_completion_rules(db, user_id, lesson_id)
    return progress


def evaluate_lesson_completion_rules(
    db: Session,
    user_id: int,
    lesson_id: int,
) -> Tuple[bool, StudentProgress]:
    """
    Evaluates explicit completion criteria for a lesson:
    1. content_completed is True (student studied concepts/mind map)
    2. practice_completed is True (at least 3 questions attempted with score >= 60%)
    Revisiting completed lesson does NOT duplicate or change completed timestamp.
    """
    progress = (
        db.query(StudentProgress)
        .filter(
            StudentProgress.user_id == user_id,
            StudentProgress.lesson_id == lesson_id,
        )
        .first()
    )

    if not progress:
        progress = start_or_resume_lesson(db, user_id, lesson_id)

    # Already completed? Preserve existing completed_at
    if progress.status == "completed":
        return True, progress

    # Verify practice requirement
    has_sufficient_practice = (
        progress.questions_attempted_count >= 3 and progress.practice_score_percent >= 60.0
    ) or (progress.practice_completed)

    # Completion rule satisfied?
    if progress.content_completed and has_sufficient_practice:
        progress.status = "completed"
        progress.completed_at = datetime.utcnow()
        db.commit()

        record_learning_event(
            db,
            user_id,
            "lesson_completed",
            lesson_id=lesson_id,
            payload={
                "attempted": progress.questions_attempted_count,
                "score_pct": progress.practice_score_percent,
                "criteria": progress.completion_criteria,
            },
        )
        check_and_unlock_achievement(db, user_id, "lesson_champion")
        return True, progress

    return False, progress


def process_question_attempt(
    db: Session,
    user_id: int,
    question_id: int,
    selected_option: str,
    time_taken_sec: int = 0,
    idempotency_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Processes an assessment attempt with strict idempotency and BKT calculation.
    The same submission will NOT update mastery twice.
    """
    # 1. Idempotency Check
    if idempotency_key:
        existing_attempt = (
            db.query(AssessmentAttempt)
            .filter(AssessmentAttempt.idempotency_key == idempotency_key)
            .first()
        )
        if existing_attempt:
            # Return cached evaluation without double-counting
            question = db.query(Question).filter(Question.id == question_id).first()
            mastery = db.query(MasteryState).filter(MasteryState.user_id == user_id, MasteryState.concept_id == question.concept_id).first()
            return {
                "is_correct": existing_attempt.is_correct,
                "correct_answer": question.correct_answer,
                "selected_option": existing_attempt.selected_option,
                "prior_p_mastery": existing_attempt.pre_p_mastery,
                "updated_p_mastery": existing_attempt.post_p_mastery,
                "mastery_status": mastery.status.value if mastery else "Developing",
                "delta_mastery": round(existing_attempt.post_p_mastery - existing_attempt.pre_p_mastery, 4),
                "is_cached_idempotent": True,
            }

    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise ValueError("Question not found")

    concept = db.query(Concept).filter(Concept.id == question.concept_id).first()
    lesson_id = question.chapter_id

    is_correct = selected_option.strip().upper() == question.correct_answer.strip().upper()

    # 2. Get current mastery state
    mastery_state = (
        db.query(MasteryState)
        .filter(
            MasteryState.user_id == user_id,
            MasteryState.concept_id == concept.id,
        )
        .first()
    )

    prior_p = mastery_state.p_mastery if mastery_state else concept.p_l0

    # 3. Calculate Bayesian Knowledge Tracing update
    updated_p, status_val, bkt_meta = update_bkt_mastery(
        p_current=prior_p,
        is_correct=is_correct,
        p_transit=concept.p_transit,
        p_guess=concept.p_guess,
        p_slip=concept.p_slip,
    )

    # 4. Update Mastery State
    if not mastery_state:
        mastery_state = MasteryState(
            user_id=user_id,
            concept_id=concept.id,
            p_mastery=updated_p,
            status=status_val,
            attempts_count=1,
            correct_count=1 if is_correct else 0,
            consecutive_correct=1 if is_correct else 0,
            consecutive_incorrect=0 if is_correct else 1,
            last_practiced_at=datetime.utcnow(),
        )
        db.add(mastery_state)
    else:
        mastery_state.p_mastery = updated_p
        mastery_state.status = status_val
        mastery_state.attempts_count += 1
        mastery_state.last_practiced_at = datetime.utcnow()
        if is_correct:
            mastery_state.correct_count += 1
            mastery_state.consecutive_correct += 1
            mastery_state.consecutive_incorrect = 0
        else:
            mastery_state.consecutive_incorrect += 1
            mastery_state.consecutive_correct = 0

    # 5. Persist Assessment Attempt
    attempt = AssessmentAttempt(
        idempotency_key=idempotency_key,
        user_id=user_id,
        question_id=question.id,
        concept_id=concept.id,
        selected_option=selected_option,
        is_correct=is_correct,
        time_taken_sec=time_taken_sec,
        pre_p_mastery=prior_p,
        post_p_mastery=updated_p,
        attempted_at=datetime.utcnow(),
    )
    db.add(attempt)

    # 6. Update Lesson Progress
    progress = start_or_resume_lesson(db, user_id, lesson_id)
    progress.questions_attempted_count = (progress.questions_attempted_count or 0) + 1
    if is_correct:
        progress.questions_correct_count = (progress.questions_correct_count or 0) + 1

    progress.practice_score_percent = round(
        (progress.questions_correct_count / max(1, progress.questions_attempted_count)) * 100, 1
    )

    if progress.questions_attempted_count >= 3 and progress.practice_score_percent >= 60.0:
        progress.practice_completed = True

    db.commit()

    # 7. Record Learning Events
    event_type = "question_correct" if is_correct else "question_incorrect"
    record_learning_event(
        db,
        user_id,
        event_type,
        lesson_id=lesson_id,
        concept_id=concept.id,
        payload={"delta": bkt_meta["delta"], "updated_p": updated_p},
        idempotency_key=f"event_{idempotency_key}" if idempotency_key else None,
    )
    record_learning_event(db, user_id, "mastery_updated", lesson_id=lesson_id, concept_id=concept.id)

    # 8. Check Achievements
    if is_correct and mastery_state.consecutive_correct >= 3:
        check_and_unlock_achievement(db, user_id, "equation_pro")

    if updated_p >= 0.75 and concept.code == "MATH8_INT_OPS":
        check_and_unlock_achievement(db, user_id, "sign_master")

    # 9. Evaluate lesson completion
    is_completed, updated_progress = evaluate_lesson_completion_rules(db, user_id, lesson_id)

    return {
        "is_correct": is_correct,
        "correct_answer": question.correct_answer,
        "selected_option": selected_option,
        "explanation": question.explanation_en,
        "prior_p_mastery": prior_p,
        "updated_p_mastery": updated_p,
        "mastery_status": status_val.value,
        "delta_mastery": bkt_meta["delta"],
        "bkt_metadata": bkt_meta,
        "lesson_progress": {
            "status": updated_progress.status,
            "attempted": updated_progress.questions_attempted_count,
            "correct": updated_progress.questions_correct_count,
            "score_percent": updated_progress.practice_score_percent,
            "content_completed": updated_progress.content_completed,
            "practice_completed": updated_progress.practice_completed,
            "is_completed": is_completed,
        },
    }


def check_and_unlock_achievement(
    db: Session,
    user_id: int,
    code: str,
) -> Optional[UserAchievement]:
    """Unlocks an achievement if not already owned by user."""
    ach = db.query(Achievement).filter(Achievement.code == code).first()
    if not ach:
        return None

    existing = (
        db.query(UserAchievement)
        .filter(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_id == ach.id,
        )
        .first()
    )

    if existing:
        return None

    unlocked = UserAchievement(
        user_id=user_id,
        achievement_id=ach.id,
        unlocked_at=datetime.utcnow(),
    )
    db.add(unlocked)
    db.commit()

    record_learning_event(
        db,
        user_id,
        "achievement_unlocked",
        payload={"achievement_code": code, "title": ach.title},
    )
    return unlocked
