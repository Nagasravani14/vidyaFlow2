"""Phase Ten and Thirteen: Comprehensive Generation and Validation Report Builder."""
from datetime import datetime, timezone
from typing import List, Dict, Any
from vidyaflow_generator.models.inventory import TextbookInventory, ChapterInventory, ChapterRecord
from vidyaflow_generator.models.report import (
    GenerationReport,
    ValidationReport,
    ChapterValidationDetail,
    TokenUsage
)


class ReportBuilder:
    """Aggregates execution metrics, validation results, and hierarchical structures."""

    @staticmethod
    def build_generation_report(
        textbook_inv: TextbookInventory,
        chapter_records: List[ChapterRecord],
        validation_details: List[ChapterValidationDetail],
        token_usage: TokenUsage,
        errors: List[Dict[str, Any]]
    ) -> GenerationReport:
        """Construct the generation coverage report."""
        val_map = {v.chapter_id: v for v in validation_details}

        total_mapped = 0
        total_summaries = 0
        total_mindmaps = 0
        total_quizzes = 0
        total_questions = 0
        total_failed = 0
        total_needs_review = 0

        # Build hierarchy: Board -> Class -> Subject -> Chapter
        hierarchy: Dict[str, Any] = {}

        for ch in chapter_records:
            val = val_map.get(ch.chapter_id)
            is_passed = val and val.overall_status == "passed"
            is_review = (not val) or val.overall_status == "needs_review"

            if is_passed:
                total_mapped += 1
                total_summaries += 1
                total_mindmaps += 1
                total_quizzes += 1
                total_questions += 20
            elif is_review:
                total_needs_review += 1
            else:
                total_failed += 1

            # Populate hierarchy
            board_key = ch.board
            class_key = f"class_{ch.class_level}"
            subj_key = ch.subject.lower().replace(" ", "_")

            if board_key not in hierarchy:
                hierarchy[board_key] = {}
            if class_key not in hierarchy[board_key]:
                hierarchy[board_key][class_key] = {}
            if subj_key not in hierarchy[board_key][class_key]:
                hierarchy[board_key][class_key][subj_key] = []

            hierarchy[board_key][class_key][subj_key].append({
                "chapter_id": ch.chapter_id,
                "chapter_number": ch.chapter_number,
                "chapter_title": ch.chapter_title,
                "page_range": [ch.start_page, ch.end_page],
                "status": "completed" if is_passed else ("needs_review" if is_review else "failed"),
                "errors": (val.quiz_errors + val.mindmap_errors) if val else []
            })

        scanned_count = sum(1 for tb in textbook_inv.textbooks if tb.is_scanned)

        return GenerationReport(
            total_pdfs_discovered=textbook_inv.total_textbooks,
            total_pdfs_extracted=len([tb for tb in textbook_inv.textbooks if tb.extraction_status == "completed"]),
            total_scanned_pdfs=scanned_count,
            total_chapters_detected=len(chapter_records),
            total_chapters_mapped=total_mapped,
            total_summaries_generated=total_summaries,
            total_mindmaps_generated=total_mindmaps,
            total_quizzes_generated=total_quizzes,
            total_questions_validated=total_questions,
            total_failed_chapters=total_failed,
            total_needs_review_chapters=total_needs_review,
            errors=errors,
            token_usage=token_usage,
            hierarchy=hierarchy,
            generated_at=datetime.now(timezone.utc).isoformat()
        )

    @staticmethod
    def build_validation_report(details: List[ChapterValidationDetail]) -> ValidationReport:
        """Construct the validation summary report."""
        passed = sum(1 for d in details if d.overall_status == "passed")
        failed = sum(1 for d in details if d.overall_status == "failed")
        review = sum(1 for d in details if d.overall_status == "needs_review")

        return ValidationReport(
            total_chapters_checked=len(details),
            total_passed=passed,
            total_failed=failed,
            total_needs_review=review,
            details=details,
            generated_at=datetime.now(timezone.utc).isoformat()
        )
