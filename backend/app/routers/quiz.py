import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    Question,
    Concept,
    Lesson,
    MasteryState,
    AssessmentAttempt,
    MasteryStatus,
)
from ..schemas import (
    QuestionOut,
    QuestionOption,
    QuestionAnswerSubmit,
    AnswerResult,
    ProgressiveHintRequest,
    ProgressiveHintResponse,
)
from ..adaptive_engine.bkt import update_bkt_mastery
from ..adaptive_engine.recommendations import determine_next_action
from ..adaptive_engine.llm_assistant import get_progressive_hint
from ..adaptive_engine.progress_manager import process_question_attempt

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.get("/questions", response_model=list[QuestionOut])
def get_quiz_questions(
    chapter_id: int = Query(default=None),
    concept_id: int = Query(default=None),
    mode: str = Query(default="adaptive"),
    limit: int = 10,
    db: Session = Depends(get_db),
):
    query = db.query(Question)

    if concept_id:
        query = query.filter(Question.concept_id == concept_id)
    elif chapter_id:
        query = query.filter(Question.chapter_id == chapter_id)

    if mode == "challenge":
        challenge_q = query.filter(Question.is_challenge == True).all()
        questions = challenge_q if challenge_q else query.filter(Question.difficulty == "hard").all()
    elif mode == "remedial":
        questions = query.filter(Question.difficulty.in_(["easy", "medium"])).all()
    else:
        questions = query.all()

    if not questions:
        questions = db.query(Question).limit(limit).all()

    results: list[QuestionOut] = []
    for q in questions[:limit]:
        concept = db.query(Concept).filter(Concept.id == q.concept_id).first()
        try:
            raw_options = json.loads(q.options_json)
            opts = [QuestionOption(id=opt["id"], text=opt["text"]) for opt in raw_options]
        except Exception:
            opts = [
                QuestionOption(id="A", text="Option A"),
                QuestionOption(id="B", text="Option B"),
            ]

        results.append(
            QuestionOut(
                id=q.id,
                concept_id=q.concept_id,
                concept_code=concept.code if concept else "MATH_GENERAL",
                concept_title=concept.title_en if concept else "General Concept",
                chapter_id=q.chapter_id,
                question_text_en=q.question_text_en,
                question_text_te=q.question_text_te,
                question_text_hi=q.question_text_hi,
                options=opts,
                difficulty=q.difficulty,
                is_challenge=q.is_challenge,
                is_remedial=q.is_remedial,
                hint_level_1=q.hint_level_1,
                hint_level_2=q.hint_level_2,
                hint_level_3=q.hint_level_3,
            )
        )

    return results


@router.post("/submit", response_model=AnswerResult)
def submit_question_answer(payload: QuestionAnswerSubmit, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == payload.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    concept = db.query(Concept).filter(Concept.id == question.concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Associated concept not found")

    # Authoritative progress and BKT attempt processing with idempotency
    result = process_question_attempt(
        db=db,
        user_id=payload.user_id,
        question_id=payload.question_id,
        selected_option=payload.selected_option,
        time_taken_sec=payload.time_taken_sec,
        idempotency_key=payload.idempotency_key,
    )

    # Next action dynamic branching
    next_action = determine_next_action(
        db,
        user_id=payload.user_id,
        current_concept_id=concept.id,
        consecutive_correct=1 if result["is_correct"] else 0,
        consecutive_incorrect=0 if result["is_correct"] else 1,
    )

    # Return multilingual explanation
    lang = payload.language.lower()
    if lang == "te" and question.explanation_te:
        explanation = question.explanation_te
    elif lang == "hi" and question.explanation_hi:
        explanation = question.explanation_hi
    else:
        explanation = question.explanation_en or "Review the step-by-step balanced transposition method."

    return AnswerResult(
        is_correct=result["is_correct"],
        correct_answer=result["correct_answer"],
        selected_option=result["selected_option"],
        explanation=explanation,
        prior_p_mastery=result["prior_p_mastery"],
        updated_p_mastery=result["updated_p_mastery"],
        mastery_status=result["mastery_status"],
        delta_mastery=result["delta_mastery"],
        bkt_metadata=result.get("bkt_metadata", {}),
        next_action=next_action,
        lesson_progress=result.get("lesson_progress"),
        is_cached_idempotent=result.get("is_cached_idempotent", False),
    )


@router.post("/hint", response_model=ProgressiveHintResponse)
def request_hint(payload: ProgressiveHintRequest, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == payload.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    concept = db.query(Concept).filter(Concept.id == question.concept_id).first()
    concept_title = concept.title_en if concept else "Algebraic Concepts"

    hint_data = get_progressive_hint(
        question_text=question.question_text_en,
        hint_level=payload.hint_level,
        concept_title=concept_title,
        language=payload.language,
        hint_level_1_fallback=question.hint_level_1,
        hint_level_2_fallback=question.hint_level_2,
        hint_level_3_fallback=question.hint_level_3,
    )

    return ProgressiveHintResponse(
        level=hint_data["level"],
        title=hint_data["title"],
        content=hint_data["content"],
        can_request_next=hint_data["can_request_next"],
    )
