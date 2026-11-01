from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    grade_level: Optional[int] = 8
    section: Optional[str] = "A"
    board: Optional[str] = "telangana"
    preferred_language: Optional[str] = "en"

    class Config:
        from_attributes = True


class ConceptNode(BaseModel):
    id: int
    code: str
    title_en: str
    title_te: Optional[str] = None
    title_hi: Optional[str] = None
    description_en: Optional[str] = None
    description_te: Optional[str] = None
    description_hi: Optional[str] = None
    order_index: int
    difficulty: float
    p_mastery: float
    status: str  # Strong, Developing, Needs Support
    is_gap: bool = False
    is_current_recommended: bool = False


class ConceptEdgeOut(BaseModel):
    id: int
    source_id: int
    target_id: int
    source_code: str
    target_code: str
    edge_type: str
    strength: float


class MindMapResponse(BaseModel):
    chapter_id: int
    chapter_title: str
    nodes: List[ConceptNode]
    edges: List[ConceptEdgeOut]
    root_cause_gaps: List[Dict[str, Any]]
    overall_mastery: float


class QuestionOption(BaseModel):
    id: str
    text: str


class QuestionOut(BaseModel):
    id: int
    concept_id: int
    concept_code: str
    concept_title: str
    chapter_id: int
    question_text_en: str
    question_text_te: Optional[str] = None
    question_text_hi: Optional[str] = None
    options: List[QuestionOption]
    difficulty: str
    is_challenge: bool = False
    is_remedial: bool = False
    hint_level_1: Optional[str] = None
    hint_level_2: Optional[str] = None
    hint_level_3: Optional[str] = None


class QuestionAnswerSubmit(BaseModel):
    user_id: int
    question_id: int
    selected_option: str
    time_taken_sec: int = 0
    language: str = "en"
    idempotency_key: Optional[str] = None


class AnswerResult(BaseModel):
    is_correct: bool
    correct_answer: str
    selected_option: str
    explanation: str
    prior_p_mastery: float
    updated_p_mastery: float
    mastery_status: str
    delta_mastery: float
    bkt_metadata: Dict[str, Any]
    next_action: Dict[str, Any]
    lesson_progress: Optional[Dict[str, Any]] = None
    is_cached_idempotent: Optional[bool] = False


class ProgressiveHintRequest(BaseModel):
    question_id: int
    hint_level: int  # 1, 2, or 3
    language: str = "en"


class ProgressiveHintResponse(BaseModel):
    level: int
    title: str
    content: str
    can_request_next: bool


class ChatRequest(BaseModel):
    user_id: int
    message: str
    language: str = "en"
    concept_code: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    language: str
    type: str


class StudentDashboardResponse(BaseModel):
    user: UserResponse
    active_chapter: Dict[str, Any]
    chapter_progress_percent: float
    today_recommendation: Dict[str, Any]
    mastery_breakdown: Dict[str, int]  # strong: N, developing: N, needs_support: N
    recent_concepts: List[ConceptNode]
    all_recommendations: List[Dict[str, Any]]
    continue_learning: Optional[Dict[str, Any]] = None
    recent_activity: List[Dict[str, Any]] = []
    achievements: List[Dict[str, Any]] = []
    subject_progress: Dict[str, float] = {}


class TeacherClassOverview(BaseModel):
    classroom_id: int
    classroom_name: str
    subject: str
    total_students: int
    distribution: Dict[str, int]  # mastered: 18, developing: 9, needs_support: 5
    ai_insights: List[str]
    interventions: List[Dict[str, Any]]
    struggling_students: List[Dict[str, Any]]


class InterventionActionRequest(BaseModel):
    intervention_id: int
    action: str  # approve, reject


class ParentDashboardResponse(BaseModel):
    child_name: str
    grade_section: str
    board: str
    subject_progress: Dict[str, int]  # Math: 78, Science: 84, English: 91
    weekly_ai_insights: List[str]
    teacher_updates: List[Dict[str, Any]]
    upcoming_tests: List[Dict[str, Any]]
    active_remedial_focus: str


class ChapterSummaryResponse(BaseModel):
    id: int
    title: str
    chapter_number: int
    board: str
    grade_level: int
    summary_en: Optional[str] = None
    summary_te: Optional[str] = None
    summary_hi: Optional[str] = None
    formulas: List[Dict[str, Any]]
    definitions: List[Dict[str, Any]]
    flashcards: List[Dict[str, Any]]


class VideoResourceResponse(BaseModel):
    id: int
    title: str
    title_te: Optional[str] = None
    title_hi: Optional[str] = None
    description: str
    description_te: Optional[str] = None
    description_hi: Optional[str] = None
    board: str
    grade_level: int
    subject: str
    chapter: str
    chapter_id: Optional[int] = None
    topic: str
    video_url: str
    thumbnail_url: str
    duration: str
    language: str
    difficulty: str
    tags: List[str] = []
    resource_type: str = "youtube"
    is_mock: bool = True
    related_concepts: List[str] = []
    key_takeaways: List[str] = []
    order_index: int = 1
    is_completed: bool = False
    completed_at: Optional[str] = None

    class Config:
        from_attributes = True


class VideoCompleteRequest(BaseModel):
    user_id: int = 1
    watch_time_seconds: Optional[int] = 0


class VideoCompleteResponse(BaseModel):
    success: bool
    video_id: int
    user_id: int
    chapter_id: Optional[int] = None
    completed: bool
    completed_at: Optional[str] = None
    message: str
    total_completed_in_chapter: int
    total_videos_in_chapter: int


class VideoProgressSummaryResponse(BaseModel):
    user_id: int
    total_videos: int
    completed_videos: int
    completion_percentage: float
    subtopics_covered: int
    total_subtopics: int
    by_difficulty: Dict[str, Dict[str, int]]

