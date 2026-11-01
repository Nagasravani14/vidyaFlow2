import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ChatMessage
from ..schemas import ChatRequest, ChatResponse
from ..services.gemini_service import gemini_service

router = APIRouter(prefix="/api/chat", tags=["chatbot"])


@router.post("/message", response_model=ChatResponse)
def send_chat_message(payload: ChatRequest, db: Session = Depends(get_db)):
    """
    Chapter-aware Socratic AI Coach endpoint.
    Retrieves authentic textbook and curriculum passages from database and invokes Gemini.
    """
    user = db.query(User).filter(User.id == payload.user_id).first()
    user_id = user.id if user else 1

    session_id = payload.session_id or f"sess_{user_id}_{uuid.uuid4().hex[:8]}"

    # Store user query in audit history
    user_msg = ChatMessage(
        user_id=user_id,
        sender="user",
        content=payload.message,
        language=payload.language,
        concept_code=payload.concept_code,
    )
    db.add(user_msg)
    db.commit()

    # Generate Chapter-Aware Socratic AI Response via centralized GeminiService
    res = gemini_service.generate_chat_response(
        user_message=payload.message,
        db=db,
        chapter_id=payload.chapter_id,
        concept_code=payload.concept_code,
        board=payload.board,
        grade_level=payload.grade_level,
        subject=payload.subject,
        language=payload.language,
    )

    # Store coach response in audit history
    coach_msg = ChatMessage(
        user_id=user_id,
        sender="coach",
        content=res["reply"],
        language=payload.language,
        concept_code=payload.concept_code,
    )
    db.add(coach_msg)
    db.commit()

    return ChatResponse(
        reply=res["reply"],
        language=res.get("language", payload.language),
        type=res.get("type", "socratic_guidance"),
        session_id=session_id,
        source_references=res.get("source_references", []),
        chapter_title=res.get("chapter_title"),
    )


@router.get("/history/{user_id}")
def get_chat_history(user_id: int, limit: int = 20, db: Session = Depends(get_db)):
    """Returns conversation history for the student."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(min(limit, 50))
        .all()
    )
    return [
        {
            "id": m.id,
            "sender": m.sender,
            "content": m.content,
            "language": m.language,
            "timestamp": m.created_at.isoformat(),
        }
        for m in reversed(messages)
    ]


@router.get("/status")
def get_ai_coach_status():
    """Returns whether Gemini API is active, configured, and ready."""
    return {
        "status": "online",
        "gemini_configured": gemini_service.is_configured(),
        "model": "gemini-3.5-flash-lite",
        "languages_supported": ["en", "te", "hi"],
    }
