from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ChatMessage
from ..schemas import ChatRequest, ChatResponse
from ..adaptive_engine.llm_assistant import generate_chat_response

router = APIRouter(prefix="/api/chat", tags=["chatbot"])


@router.post("/message", response_model=ChatResponse)
def send_chat_message(payload: ChatRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        user_id = 1
    else:
        user_id = user.id

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

    # Generate assistant Socratic guidance
    res = generate_chat_response(
        user_query=payload.message,
        concept_context=payload.concept_code,
        language=payload.language,
    )

    # Store coach response
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
        language=res["language"],
        type=res["type"],
    )


@router.get("/history/{user_id}")
def get_chat_history(user_id: int, limit: int = 20, db: Session = Depends(get_db)):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
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
