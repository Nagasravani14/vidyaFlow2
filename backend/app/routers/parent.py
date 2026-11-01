from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserRole
from ..schemas import ParentDashboardResponse

router = APIRouter(prefix="/api/parent", tags=["parent"])


@router.get("/overview", response_model=ParentDashboardResponse)
def get_parent_overview(db: Session = Depends(get_db)):
    student = db.query(User).filter(User.role == UserRole.STUDENT).first()
    student_name = student.name if student else "Ananya Sharma"

    subject_progress = {
        "Mathematics": 78,
        "Science": 84,
        "English": 91,
        "Social Studies": 82,
    }

    weekly_ai_insights = [
        "📈 Your child Ananya is showing strong growth in Algebra (+16% this week), solving 12 equations independently.",
        "🔍 Knowledge Tracing flagged a minor prerequisite gap in signed Integer Operations; 10 minutes of targeted flashcard review is scheduled.",
        "⭐ Great consistency: Ananya spent 42 minutes practicing this week with a 75% first-attempt success rate.",
    ]

    teacher_updates = [
        {
            "teacher": "Mr. R. Sharma (Math)",
            "date": "Today, 09:30 AM",
            "message": "Ananya is active in class discussions on linear equations! We have scheduled a light remedial worksheet on negative number signs to boost confidence.",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        },
        {
            "teacher": "Mrs. Kalyani (Science)",
            "date": "Yesterday, 04:15 PM",
            "message": "Excellent lab submission on Cell Structure! Ananya scored 19/20 in the diagnostic test.",
            "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        },
    ]

    upcoming_tests = [
        {
            "subject": "Mathematics",
            "title": "Chapter 3: Linear Equations Diagnostic Test",
            "date": "Nov 6, 2026",
            "syllabus": "Standard equations, Transposition, Word Problems",
            "readiness": "78% Ready",
        },
        {
            "subject": "Physical Science",
            "title": "Unit 2: Force & Pressure Periodic Assessment",
            "date": "Nov 10, 2026",
            "syllabus": "Contact and Non-contact Forces, Atmospheric Pressure",
            "readiness": "88% Ready",
        },
    ]

    return ParentDashboardResponse(
        child_name=student_name,
        grade_section="Class 8 - Section A",
        board="Telangana State Board",
        subject_progress=subject_progress,
        weekly_ai_insights=weekly_ai_insights,
        teacher_updates=teacher_updates,
        upcoming_tests=upcoming_tests,
        active_remedial_focus="Integer Operations & Transposition Rules",
    )
