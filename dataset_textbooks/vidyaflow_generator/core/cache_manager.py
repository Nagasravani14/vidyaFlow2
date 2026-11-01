"""Phase Eight: Cache and Resume Manager for Interrupted and Incremental Runs."""
import json
import logging
from pathlib import Path
from typing import Optional, Tuple
from vidyaflow_generator.models.inventory import ChapterRecord
from vidyaflow_generator.models.summary import ChapterSummary
from vidyaflow_generator.models.mindmap import MindMapData
from vidyaflow_generator.models.quiz import QuizBank
from vidyaflow_generator.config import CACHE_DIR

logger = logging.getLogger(__name__)


class CacheManager:
    """Manages disk caching of extracted text and generated content for fault tolerance and speed."""

    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = Path(cache_dir) if cache_dir else CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def is_chapter_completed(self, chapter_id: str) -> bool:
        """Check whether a chapter has already been generated and cached."""
        ch_dir = self.cache_dir / chapter_id
        if not ch_dir.exists():
            return False

        files = ["summary.json", "mindmap.json", "quiz.json"]
        return all((ch_dir / f).exists() for f in files)

    def load_cached_chapter(
        self,
        chapter_id: str
    ) -> Tuple[Optional[ChapterSummary], Optional[MindMapData], Optional[QuizBank]]:
        """Load cached summary, mindmap, and quiz for a chapter if available."""
        ch_dir = self.cache_dir / chapter_id
        if not self.is_chapter_completed(chapter_id):
            return None, None, None

        try:
            summary_raw = json.loads((ch_dir / "summary.json").read_text(encoding="utf-8"))
            mindmap_raw = json.loads((ch_dir / "mindmap.json").read_text(encoding="utf-8"))
            quiz_raw = json.loads((ch_dir / "quiz.json").read_text(encoding="utf-8"))

            summary = ChapterSummary.model_validate(summary_raw)
            mindmap = MindMapData.model_validate(mindmap_raw)
            quiz = QuizBank.model_validate(quiz_raw)
            return summary, mindmap, quiz
        except Exception as e:
            logger.warning(f"Failed to load cached content for {chapter_id}: {e}")
            return None, None, None

    def save_chapter_to_cache(
        self,
        chapter: ChapterRecord,
        summary: ChapterSummary,
        mindmap: MindMapData,
        quiz: QuizBank,
        model_name: str = "offline"
    ):
        """Save generated chapter artifacts to disk cache."""
        ch_dir = self.cache_dir / chapter.chapter_id
        ch_dir.mkdir(parents=True, exist_ok=True)

        (ch_dir / "summary.json").write_text(summary.model_dump_json(indent=2, by_alias=True), encoding="utf-8")
        (ch_dir / "mindmap.json").write_text(mindmap.model_dump_json(indent=2, by_alias=True), encoding="utf-8")
        (ch_dir / "quiz.json").write_text(quiz.model_dump_json(indent=2, by_alias=True), encoding="utf-8")

        # Cache metadata
        meta = {
            "chapter_id": chapter.chapter_id,
            "textbook_id": chapter.textbook_id,
            "model_name": model_name,
            "version": "1.0.0"
        }
        (ch_dir / "cache_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
