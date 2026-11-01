import enum
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from .database import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    PARENT = "parent"


class MasteryStatus(str, enum.Enum):
    STRONG = "Strong"
    DEVELOPING = "Developing"
    NEEDS_SUPPORT = "Needs Support"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    grade_level = Column(Integer, default=8)  # 6-10
    section = Column(String(10), default="A")
    board = Column(String(50), default="telangana")  # telangana, cbse, icse
    preferred_language = Column(String(10), default="en")  # en, te, hi
    avatar_url = Column(String(255), nullable=True)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    mastery_states = relationship("MasteryState", back_populates="user", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("AIRecommendation", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    progress_records = relationship("StudentProgress", back_populates="user", cascade="all, delete-orphan")
    learning_events = relationship("LearningEvent", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")


class ClassRoom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # e.g., "Class 8A"
    grade_level = Column(Integer, default=8)
    section = Column(String(10), default="A")
    board = Column(String(50), default="telangana")
    subject = Column(String(50), default="Mathematics")
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    total_students = Column(Integer, default=32)
    created_at = Column(DateTime, default=datetime.utcnow)


class Textbook(Base):
    """Represents an authentic textbook from dataset_textbooks."""
    __tablename__ = "textbooks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    filename = Column(String(255), unique=True, nullable=False)
    board = Column(String(50), default="telangana")
    grade_level = Column(Integer, nullable=False)  # 6, 7, 8, 9, 10
    subject = Column(String(50), nullable=False)    # Mathematics, Physical Science, Physics, Biology, General Science, Social Studies
    total_pages = Column(Integer, default=0)
    file_path = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    lessons = relationship("Lesson", back_populates="textbook", cascade="all, delete-orphan", order_by="Lesson.chapter_number")


class Lesson(Base):
    """Represents a specific chapter/lesson in an authentic textbook."""
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    textbook_id = Column(Integer, ForeignKey("textbooks.id"), nullable=False)
    chapter_number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    slug = Column(String(150), index=True)
    page_start = Column(Integer, default=1)
    page_end = Column(Integer, default=1)
    overview = Column(Text, nullable=True)
    has_mindmap = Column(Boolean, default=False)
    has_practice = Column(Boolean, default=False)
    summary_en = Column(Text, nullable=True)
    summary_te = Column(Text, nullable=True)
    summary_hi = Column(Text, nullable=True)
    formulas_json = Column(Text, nullable=True)
    definitions_json = Column(Text, nullable=True)
    flashcards_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    textbook = relationship("Textbook", back_populates="lessons")
    concepts = relationship("Concept", back_populates="lesson", cascade="all, delete-orphan", order_by="Concept.order_index")
    questions = relationship("Question", back_populates="lesson", cascade="all, delete-orphan")
    progress_records = relationship("StudentProgress", back_populates="lesson", cascade="all, delete-orphan")


# Legacy Chapter alias pointing to Lesson for backward compatibility
Chapter = Lesson


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    code = Column(String(60), unique=True, index=True)  # e.g. "MATH8_LIN_VARS"
    title_en = Column(String(200), nullable=False)
    title_te = Column(String(200), nullable=True)
    title_hi = Column(String(200), nullable=True)
    description_en = Column(Text, nullable=True)
    description_te = Column(Text, nullable=True)
    description_hi = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    difficulty_level = Column(Float, default=0.5)

    # Bayesian Knowledge Tracing base parameters
    p_l0 = Column(Float, default=0.20)      # Initial mastery probability
    p_transit = Column(Float, default=0.15) # Transition / learning rate
    p_guess = Column(Float, default=0.20)   # Guess probability
    p_slip = Column(Float, default=0.10)    # Slip probability

    lesson = relationship("Lesson", back_populates="concepts")
    chapter = relationship("Lesson", viewonly=True)  # alias
    questions = relationship("Question", back_populates="concept")
    mastery_states = relationship("MasteryState", back_populates="concept")


class ConceptEdge(Base):
    """Prerequisite relationship: source_concept -> target_concept"""
    __tablename__ = "concept_edges"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    edge_type = Column(String(50), default="prerequisite")
    strength = Column(Float, default=1.0)


class MasteryState(Base):
    __tablename__ = "mastery_states"
    __table_args__ = (UniqueConstraint("user_id", "concept_id", name="uq_user_concept_mastery"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    p_mastery = Column(Float, default=0.20)
    status = Column(SQLEnum(MasteryStatus), default=MasteryStatus.NEEDS_SUPPORT)
    attempts_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    consecutive_correct = Column(Integer, default=0)
    consecutive_incorrect = Column(Integer, default=0)
    last_practiced_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="mastery_states")
    concept = relationship("Concept", back_populates="mastery_states")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    question_text_en = Column(Text, nullable=False)
    question_text_te = Column(Text, nullable=True)
    question_text_hi = Column(Text, nullable=True)
    options_json = Column(Text, nullable=False)  # JSON array of options
    correct_answer = Column(String(10), nullable=False)  # e.g., "A", "B", "C", "D"
    explanation_en = Column(Text, nullable=True)
    explanation_te = Column(Text, nullable=True)
    explanation_hi = Column(Text, nullable=True)
    difficulty = Column(String(20), default="medium")  # easy, medium, hard
    hint_level_1 = Column(Text, nullable=True)
    hint_level_2 = Column(Text, nullable=True)
    hint_level_3 = Column(Text, nullable=True)
    is_challenge = Column(Boolean, default=False)
    is_remedial = Column(Boolean, default=False)

    concept = relationship("Concept", back_populates="questions")
    lesson = relationship("Lesson", back_populates="questions")
    chapter = relationship("Lesson", viewonly=True)
    attempts = relationship("AssessmentAttempt", back_populates="question")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    idempotency_key = Column(String(100), unique=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    selected_option = Column(String(10), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    time_taken_sec = Column(Integer, default=0)
    pre_p_mastery = Column(Float, nullable=False)
    post_p_mastery = Column(Float, nullable=False)
    attempted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="attempts")
    question = relationship("Question", back_populates="attempts")


class StudentProgress(Base):
    """
    Tracks authoritative lesson start, progress, and completion according to Section 6.
    Opening a lesson must NOT mark it completed.
    Explicit completion criteria: content completed + practice requirements met.
    """
    __tablename__ = "student_progress"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson_progress"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    last_accessed_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(30), default="in_progress")  # in_progress, completed
    content_completed = Column(Boolean, default=False)
    practice_completed = Column(Boolean, default=False)
    concepts_viewed_count = Column(Integer, default=0)
    questions_attempted_count = Column(Integer, default=0)
    questions_correct_count = Column(Integer, default=0)
    practice_score_percent = Column(Float, default=0.0)
    completion_criteria = Column(String(100), default="v1_content_and_practice")

    user = relationship("User", back_populates="progress_records")
    lesson = relationship("Lesson", back_populates="progress_records")


class LearningEvent(Base):
    """Database-backed event stream as mandated by Section 5."""
    __tablename__ = "learning_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=True)
    event_type = Column(String(60), nullable=False)  # lesson_started, concept_opened, practice_started, etc.
    idempotency_key = Column(String(100), unique=True, nullable=True)
    event_payload_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="learning_events")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(60), unique=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    badge_icon = Column(String(60), default="Award")
    xp_reward = Column(Integer, default=50)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=True)
    recommendation_type = Column(String(50), default="remediation")
    priority = Column(Integer, default=1)
    title = Column(String(200), nullable=False)
    reason = Column(Text, nullable=False)
    action_route = Column(String(100), default="/student/practice")
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")


class TeacherIntervention(Base):
    __tablename__ = "teacher_interventions"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=True)
    title = Column(String(200), nullable=False)
    intervention_type = Column(String(50), default="remedial_group")
    status = Column(String(30), default="pending")  # pending, approved, rejected
    student_names_json = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    suggested_action = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender = Column(String(20), default="user")
    content = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    concept_code = Column(String(60), nullable=True)
    hint_level = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")
