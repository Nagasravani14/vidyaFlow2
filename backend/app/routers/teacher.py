import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserRole, ClassRoom, TeacherIntervention, MasteryState
from ..schemas import TeacherClassOverview, InterventionActionRequest

router = APIRouter(prefix="/api/teacher", tags=["teacher"])


@router.get("/overview", response_model=TeacherClassOverview)
def get_teacher_class_overview(db: Session = Depends(get_db)):
    classroom = db.query(ClassRoom).filter(ClassRoom.name == "Class 8A").first()
    if not classroom:
        classroom = db.query(ClassRoom).first()

    interventions_db = db.query(TeacherIntervention).order_by(TeacherIntervention.created_at.desc()).all()
    
    formatted_interventions = []
    for it in interventions_db:
        try:
            students = json.loads(it.student_names_json)
        except Exception:
            students = [it.student_names_json]
            
        formatted_interventions.append({
            "id": it.id,
            "title": it.title,
            "type": it.intervention_type,
            "status": it.status,
            "students": students,
            "rationale": it.rationale,
            "suggested_action": it.suggested_action,
        })

    # AI Class Insights
    ai_insights = [
        "⚠️ 5 students (15.6%) are consistently struggling with signed Integer Operations, blocking equation transposition.",
        "📊 Fractions reduction is a class-wide gap: 48% error rate detected on cross-multiplication fractional equations.",
        "⚡ Rahul Nair and Tanvi Rao have reached 95%+ Mastery and are eligible for Olympiad-grade Challenge Modules.",
        "💡 AI Recommendation: Run a 10-minute Peer Tutoring session before the Friday Unit Assessment.",
    ]

    # Dynamically reflect Ananya's latest live mastery score
    ananya = db.query(User).filter(User.role == UserRole.STUDENT).first()
    ananya_mastery = "42%"
    ananya_trend = "improving"
    if ananya:
        ananya_state = (
            db.query(MasteryState)
            .filter(MasteryState.user_id == ananya.id)
            .order_by(MasteryState.last_practiced_at.desc())
            .first()
        )
        if ananya_state:
            ananya_mastery = f"{int(ananya_state.p_mastery * 100)}%"
            if ananya_state.p_mastery >= 0.75:
                ananya_trend = "mastered"
            elif ananya_state.p_mastery >= 0.45:
                ananya_trend = "improving"

    struggling_students = [
        {"name": "Ananya Sharma", "gap": "Integer Operations & Transposition", "mastery": ananya_mastery, "trend": ananya_trend},
        {"name": "Sneha Reddy", "gap": "Variables on Both Sides", "mastery": "38%", "trend": "needs_remediation"},
        {"name": "Karthik Verma", "gap": "Negative Signs Multiplication", "mastery": "35%", "trend": "needs_remediation"},
        {"name": "Arjun Rao", "gap": "Fractional Equations", "mastery": "41%", "trend": "stable"},
        {"name": "Divya Patel", "gap": "Word Problem Translation", "mastery": "44%", "trend": "improving"},
    ]

    return TeacherClassOverview(
        classroom_id=classroom.id if classroom else 1,
        classroom_name=classroom.name if classroom else "Class 8A",
        subject=classroom.subject if classroom else "Mathematics",
        total_students=32,
        distribution={
            "mastered": 18,
            "developing": 9,
            "needs_support": 5,
        },
        ai_insights=ai_insights,
        interventions=formatted_interventions,
        struggling_students=struggling_students,
    )


@router.post("/intervention/action")
def take_intervention_action(payload: InterventionActionRequest, db: Session = Depends(get_db)):
    """Teacher action: Approve or Reject an AI suggested intervention."""
    intervention = db.query(TeacherIntervention).filter(TeacherIntervention.id == payload.intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")

    action = payload.action.lower()
    if action in ["approve", "approved"]:
        intervention.status = "approved"
    elif action in ["reject", "rejected"]:
        intervention.status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Action must be approve or reject")

    db.commit()
    return {
        "status": "success",
        "intervention_id": intervention.id,
        "new_status": intervention.status,
        "message": f"Intervention successfully {intervention.status} by Teacher."
    }
