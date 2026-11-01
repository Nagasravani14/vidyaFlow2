"""Phase Seven: Multilingual Support and Schema Alignment."""
from typing import Dict, Any, Optional
from vidyaflow_generator.models.summary import ChapterSummary
from vidyaflow_generator.models.mindmap import MindMapData, MindMapNode
from vidyaflow_generator.models.quiz import QuizBank, QuizQuestion


class MultilingualAdapter:
    """
    Enables future and current multilingual representation across English, Telugu, and Hindi,
    ensuring that chapter_id, concept_id, and question_id remain strictly invariant across languages.
    """

    @staticmethod
    def export_multilingual_bundle(
        summary: ChapterSummary,
        mindmap: MindMapData,
        quiz: QuizBank,
        source_language: str = "English"
    ) -> Dict[str, Any]:
        """
        Creates a unified multilingual dictionary aligned with VidyaFlow platform schema
        with extensible language slots for 'en', 'te', and 'hi'.
        """
        lang_key = "en" if "eng" in source_language.lower() else ("te" if "tel" in source_language.lower() else "hi")

        bundle: Dict[str, Any] = {
            "chapter_id": summary.chapter_id,
            "class": summary.class_level,
            "subject": summary.subject,
            "source_language": source_language,
            "title": {
                "en": summary.title if lang_key == "en" else "",
                "te": summary.title if lang_key == "te" else "",
                "hi": summary.title if lang_key == "hi" else "",
            },
            "summary": {
                "en": summary.chapter_overview if lang_key == "en" else "",
                "te": summary.chapter_overview if lang_key == "te" else "",
                "hi": summary.chapter_overview if lang_key == "hi" else "",
            },
            "mindmap_tree": mindmap.model_dump(by_alias=True),
            "questions": []
        }

        # Populate question records with multilingual slots
        for q in quiz.questions:
            bundle["questions"].append({
                "question_id": q.question_id,
                "concept_id": q.concept_id,
                "difficulty": q.difficulty,
                "source_page": q.source_page,
                "question_text": {
                    "en": q.question if lang_key == "en" else "",
                    "te": q.question if lang_key == "te" else "",
                    "hi": q.question if lang_key == "hi" else "",
                },
                "options": [
                    {
                        "id": opt.id,
                        "text": {
                            "en": opt.text if lang_key == "en" else "",
                            "te": opt.text if lang_key == "te" else "",
                            "hi": opt.text if lang_key == "hi" else "",
                        }
                    }
                    for opt in q.options
                ],
                "correct_answer": q.correct_answer,
                "explanation": {
                    "en": q.explanation if lang_key == "en" else "",
                    "te": q.explanation if lang_key == "te" else "",
                    "hi": q.explanation if lang_key == "hi" else "",
                }
            })

        return bundle
