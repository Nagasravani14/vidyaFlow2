"""Tests for Text Extractor, Multilingual Adapter, and Cache Manager."""
import json
from pathlib import Path
from vidyaflow_generator.models.inventory import TextbookRecord, ChapterRecord
from vidyaflow_generator.core.text_extractor import TextExtractor
from vidyaflow_generator.core.multilingual import MultilingualAdapter
from vidyaflow_generator.core.cache_manager import CacheManager


def test_text_extractor_class_6_maths(sample_textbook):
    pdf_path = Path("VI Maths EM Final 2026-27.pdf")
    if not pdf_path.exists():
        return

    sample_textbook.filename = "VI Maths EM Final 2026-27.pdf"
    sample_textbook.class_level = 6
    sample_textbook.subject = "Mathematics"

    extractor = TextExtractor()
    chapters = extractor.extract_chapters(sample_textbook, pdf_path)
    assert len(chapters) >= 10
    ch1 = chapters[0]
    assert ch1.chapter_number == 1
    assert "Knowing Our Numbers" in ch1.chapter_title
    assert ch1.start_page == 1
    assert ch1.end_page == 15
    assert ch1.pdf_start_page is not None
    assert ch1.char_count > 10000


def test_multilingual_adapter_preserves_ids(sample_summary, sample_mindmap, sample_quiz):
    bundle = MultilingualAdapter.export_multilingual_bundle(
        summary=sample_summary,
        mindmap=sample_mindmap,
        quiz=sample_quiz,
        source_language="English"
    )
    assert bundle["chapter_id"] == sample_summary.chapter_id
    assert bundle["title"]["en"] == sample_summary.title
    assert len(bundle["questions"]) == 20
    assert bundle["questions"][0]["question_id"] == sample_quiz.questions[0].question_id
    assert bundle["questions"][0]["concept_id"] == sample_quiz.questions[0].concept_id
    assert "en" in bundle["questions"][0]["question_text"]
    assert "te" in bundle["questions"][0]["question_text"]
    assert "hi" in bundle["questions"][0]["question_text"]


def test_cache_and_resume(tmp_path, sample_chapter, sample_summary, sample_mindmap, sample_quiz):
    cache = CacheManager(cache_dir=tmp_path)
    assert cache.is_chapter_completed(sample_chapter.chapter_id) is False

    cache.save_chapter_to_cache(sample_chapter, sample_summary, sample_mindmap, sample_quiz)
    assert cache.is_chapter_completed(sample_chapter.chapter_id) is True

    s, m, q = cache.load_cached_chapter(sample_chapter.chapter_id)
    assert s is not None
    assert m is not None
    assert q is not None
    assert s.chapter_id == sample_chapter.chapter_id
    assert len(q.questions) == 20
