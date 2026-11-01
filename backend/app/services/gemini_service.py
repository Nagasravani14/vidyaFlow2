"""
Centralized Gemini AI Service for VidyaFlow.
Uses the official google-genai SDK with secure configuration, graceful fallback,
quota and error handling, and chapter-aware textbook retrieval.
"""

import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session

from ..config import settings
from ..models import Lesson, Concept, Textbook, Question

logger = logging.getLogger("vidyaflow.gemini")

# Fast, stable fallback models in case the configured model is deprecated or unavailable
FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]


class GeminiService:
    def __init__(self):
        self._client = None
        self._init_client()

    def _init_client(self):
        api_key = settings.api_key
        if api_key and api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self._client = genai.Client(api_key=api_key)
                logger.info("[GeminiService] Initialized Google GenAI client successfully.")
            except Exception as e:
                logger.warning(f"[GeminiService] Failed to initialize Google GenAI client: {e}")
                self._client = None
        else:
            self._client = None

    def is_configured(self) -> bool:
        """Check if a valid Gemini API key is configured."""
        key = settings.api_key
        return bool(key and key != "your_gemini_api_key_here" and len(key) > 10)

    def generate_chat_response(
        self,
        user_message: str,
        db: Optional[Session] = None,
        chapter_id: Optional[int] = None,
        concept_code: Optional[str] = None,
        board: Optional[str] = None,
        grade_level: Optional[int] = None,
        subject: Optional[str] = None,
        language: str = "en",
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """
        Generates a chapter-aware Socratic tutoring response.
        Handles missing keys, quota limits, model deprecation, and network errors gracefully.
        """
        # Validate message
        clean_message = (user_message or "").strip()
        if not clean_message:
            return {
                "reply": "Please enter a question or topic so I can help you learn!",
                "language": language,
                "type": "error",
                "source_references": [],
                "chapter_title": None,
            }

        # Truncate overly long messages for safety (max 2000 characters)
        if len(clean_message) > 2000:
            clean_message = clean_message[:2000]

        # 1. Retrieve chapter context from database if available
        chapter_context, chapter_title, sources = self._retrieve_chapter_context(
            db=db,
            chapter_id=chapter_id,
            concept_code=concept_code,
            board=board,
            grade_level=grade_level,
            subject=subject,
        )

        # 2. Check if Gemini is configured
        if not self.is_configured() or not self._client:
            return {
                "reply": (
                    "⚠️ **Gemini API Key Missing**: The Gemini API key is not configured in `backend/.env`. "
                    "Please set `GEMINI_API_KEY=your_key` in `backend/.env` to enable live Socratic AI Coach responses."
                ),
                "language": language,
                "type": "configuration_error",
                "source_references": sources,
                "chapter_title": chapter_title,
            }

        # 3. Build prompt and system instructions
        system_instruction = self._build_system_instruction(
            grade_level=grade_level or 8,
            subject=subject or "Mathematics",
            chapter_title=chapter_title,
            chapter_context=chapter_context,
            language=language,
        )

        full_prompt = f"{system_instruction}\n\nStudent says:\n\"{clean_message}\""

        # 4. Invoke Gemini with model fallback handling
        reply_text, error_type = self._call_gemini_with_fallback(full_prompt)

        return {
            "reply": reply_text,
            "language": language,
            "type": error_type or "socratic_guidance",
            "source_references": sources,
            "chapter_title": chapter_title,
        }

    def _retrieve_chapter_context(
        self,
        db: Optional[Session],
        chapter_id: Optional[int] = None,
        concept_code: Optional[str] = None,
        board: Optional[str] = None,
        grade_level: Optional[int] = None,
        subject: Optional[str] = None,
    ) -> tuple[str, Optional[str], List[str]]:
        """Retrieves authentic textbook passages, concepts, and overview from SQLite."""
        if not db:
            return "No database session available.", None, []

        lesson = None
        if chapter_id:
            lesson = db.query(Lesson).filter(Lesson.id == chapter_id).first()

        if not lesson and concept_code:
            concept = db.query(Concept).filter(Concept.code == concept_code).first()
            if concept:
                lesson = db.query(Lesson).filter(Lesson.id == concept.chapter_id).first()

        if not lesson:
            # Default to active lesson in Mathematics Class 8
            lesson = db.query(Lesson).filter(Lesson.slug.like("%linear_equation%")).first()

        if not lesson:
            return "No specific textbook chapter context found.", None, []

        tb = lesson.textbook
        chapter_title = lesson.title
        sources = []

        context_lines = [
            f"TEXTBOOK: {tb.title if tb else 'Standard Curriculum'}",
            f"BOARD: {tb.board if tb else board or 'Telangana State Board'}",
            f"CLASS / GRADE: Class {tb.grade_level if tb else grade_level or 8}",
            f"SUBJECT: {tb.subject if tb else subject or 'Mathematics'}",
            f"CHAPTER {lesson.chapter_number}: {lesson.title}",
        ]

        if lesson.page_start and lesson.page_end:
            sources.append(f"{lesson.title} (Pages {lesson.page_start}–{lesson.page_end})")
        else:
            sources.append(f"{lesson.title}")

        if lesson.overview:
            context_lines.append(f"CHAPTER OVERVIEW: {lesson.overview}")

        if lesson.summary_en:
            context_lines.append(f"TEXTBOOK KEY SUMMARY: {lesson.summary_en}")

        # Add mapped concepts
        concepts = db.query(Concept).filter(Concept.chapter_id == lesson.id).order_by(Concept.order_index.asc()).all()
        if concepts:
            context_lines.append("CORE CHAPTER CONCEPTS:")
            for c in concepts[:8]:
                desc = c.description_en or ""
                context_lines.append(f"- {c.title_en} ({c.code}): {desc}")
                sources.append(f"Concept: {c.title_en}")

        return "\n".join(context_lines), chapter_title, sources

    def _build_system_instruction(
        self,
        grade_level: int,
        subject: str,
        chapter_title: Optional[str],
        chapter_context: str,
        language: str,
    ) -> str:
        lang_instruction = {
            "te": "Respond fluently in Telugu (తెలుగు) with clear mathematical/scientific terms explained simply.",
            "hi": "Respond fluently in Hindi (हिन्दी) with clear mathematical/scientific terms explained simply.",
            "en": "Respond in clear, encouraging, age-appropriate English.",
        }.get(language.lower(), "Respond in clear, encouraging English.")

        return f"""You are the VidyaFlow Socratic AI Learning Coach, a patient, encouraging tutor for students in Classes 6–10 in Indian curricula (Telangana State Board and ICSE).

CORE PEDAGOGICAL RULES:
1. Tone & Level: Adapt explanations strictly for a Class {grade_level} student studying {subject}. Be warm, positive, and clear.
2. Socratic Guidance: When the student asks for solutions to homework or practice problems, DO NOT simply blurt out the final numerical answer. Instead, give a helpful conceptual hint, point out the first step, or ask a gentle question to guide their thinking.
3. Textbook Grounding:
{chapter_context}
- Prefer facts and methods from the selected chapter: "{chapter_title or 'General Curriculum'}".
- Clearly distinguish textbook-supported facts from additional analogies or real-world examples.
- If relevant textbook content is not present in the chapter context above, state: "While this specific detail isn't in our current chapter textbook pages, here is how the concept works..."
- Never invent or fabricate syllabus content.
4. Multilingual: {lang_instruction}
5. Brevity: Keep explanations focused (2–4 short paragraphs), and end with a short check-for-understanding question when useful."""

    def _call_gemini_with_fallback(self, prompt: str) -> tuple[str, Optional[str]]:
        """Invokes Gemini, trying the configured model first, and falling back safely if needed."""
        if not self._client:
            self._init_client()
            if not self._client:
                return (
                    "Gemini API client could not be initialized. Please verify your GEMINI_API_KEY in `backend/.env`.",
                    "client_error",
                )

        # Primary model from settings
        models_to_try = [settings.GEMINI_MODEL]
        for fb in FALLBACK_MODELS:
            if fb not in models_to_try:
                models_to_try.append(fb)

        last_error = None
        for model_name in models_to_try:
            try:
                response = self._client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text:
                    return response.text.strip(), None
            except Exception as e:
                err_str = str(e)
                last_error = e
                # Check for 404 (model not found / deprecated) -> proceed to next model
                if "404" in err_str or "NOT_FOUND" in err_str:
                    logger.warning(f"[GeminiService] Model '{model_name}' not available. Trying fallback...")
                    continue
                # Check for Quota Exceeded (429)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    logger.error(f"[GeminiService] Quota exhausted: {e}")
                    return (
                        "⏳ **Gemini API Quota Limit Reached**: The current Gemini API key has exceeded its rate limit or free quota. "
                        "Please check your Google AI Studio quota or try again in a few moments.",
                        "quota_exhausted",
                    )
                # Check for Invalid Key (401/403/INVALID_ARGUMENT)
                if "API_KEY_INVALID" in err_str or "401" in err_str or "403" in err_str:
                    logger.error(f"[GeminiService] Invalid API key: {e}")
                    return (
                        "🔑 **Invalid Gemini API Key**: The configured API key is not authorized. "
                        "Please verify the `GEMINI_API_KEY` in `backend/.env`.",
                        "invalid_api_key",
                    )
                # Other errors
                logger.error(f"[GeminiService] Error with model '{model_name}': {e}")
                continue

        # If all model attempts failed
        logger.error(f"[GeminiService] All Gemini model attempts failed. Last error: {last_error}")
        return (
            "I encountered a temporary connection issue while contacting the Gemini AI service. "
            "Please try asking your question again in a moment.",
            "service_unavailable",
        )


# Centralized singleton instance
gemini_service = GeminiService()
