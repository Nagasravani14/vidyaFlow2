"""CLI and Pipeline Coordinator for VidyaFlow Dataset Generator."""
import sys
import argparse
import logging
from pathlib import Path
from typing import Optional, List

from vidyaflow_generator.config import (
    DEFAULT_INPUT_DIR,
    DEFAULT_OUTPUT_DIR,
    DEFAULT_OUTPUT_ZIP,
    DEFAULT_MODEL
)
from vidyaflow_generator.core.inventory_scanner import InventoryScanner
from vidyaflow_generator.core.text_extractor import TextExtractor
from vidyaflow_generator.core.gemini_client import GeminiClient
from vidyaflow_generator.core.content_generator import ContentGenerator
from vidyaflow_generator.core.validator import ContentValidator
from vidyaflow_generator.core.math_verifier import MathVerifier
from vidyaflow_generator.core.cache_manager import CacheManager
from vidyaflow_generator.core.exporter import ContentExporter
from vidyaflow_generator.core.report_builder import ReportBuilder
from vidyaflow_generator.models.inventory import ChapterInventory, ChapterRecord

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("vidyaflow")


def run_pipeline(
    input_path: Path,
    output_dir: Path,
    output_zip: Path,
    pilot_mode: bool = False,
    target_class: Optional[int] = None,
    target_subject: Optional[str] = None,
    limit_chapters_per_book: Optional[int] = None,
    force_offline: bool = False,
    force_regenerate: bool = False,
    model_name: Optional[str] = None
) -> int:
    """Execute the complete 15-phase generation pipeline."""
    logger.info("=" * 60)
    logger.info("STARTING VIDYAFLOW DATASET GENERATION PIPELINE")
    logger.info("=" * 60)

    # 1. Initialize Components
    scanner = InventoryScanner()
    extractor = TextExtractor()
    math_verifier = MathVerifier()
    validator = ContentValidator(math_verifier=math_verifier)
    cache_mgr = CacheManager()
    exporter = ContentExporter(output_dir=output_dir, output_zip=output_zip)

    gemini_client = GeminiClient(model=model_name or DEFAULT_MODEL)
    generator = ContentGenerator(
        gemini_client=gemini_client,
        validator=validator,
        force_offline=force_offline or (not gemini_client.has_api_key)
    )

    if generator.force_offline:
        logger.info("Mode: Offline Deterministic Generator (Rule-based textbook parser & verifier)")
    else:
        logger.info(f"Mode: Google Gemini Live API ({gemini_client.primary_model})")

    # 2. Phase 1: PDF Inventory
    logger.info(f"\n[PHASE 1] Scanning input path: {input_path}")
    scan_dir = scanner.extract_zip_if_needed(input_path)
    textbook_inv = scanner.scan_directory(scan_dir)
    logger.info(f"Discovered {textbook_inv.total_textbooks} textbooks with {textbook_inv.total_pages} total pages.")

    # Filter textbooks if requested
    textbooks_to_process = textbook_inv.textbooks
    if target_class is not None:
        textbooks_to_process = [tb for tb in textbooks_to_process if tb.class_level == target_class]
        logger.info(f"Filtered by Class {target_class}: {len(textbooks_to_process)} textbooks")
    if target_subject is not None:
        textbooks_to_process = [tb for tb in textbooks_to_process if target_subject.lower() in tb.subject.lower()]
        logger.info(f"Filtered by Subject '{target_subject}': {len(textbooks_to_process)} textbooks")

    # In pilot mode, pick the first valid non-duplicate textbook
    if pilot_mode:
        candidate_books = [tb for tb in textbooks_to_process if not tb.is_duplicate and tb.extraction_status == "completed"]
        textbooks_to_process = candidate_books[:1] if candidate_books else textbooks_to_process[:1]
        logger.info(f"Pilot Mode activated: Processing single textbook '{textbooks_to_process[0].filename}'")

    # 3. Phase 2: PDF Text Extraction & Chapter Discovery
    logger.info("\n[PHASE 2] Extracting textbook chapters and parsing boundaries...")
    all_chapter_records: List[ChapterRecord] = []

    for tb in textbooks_to_process:
        if tb.is_duplicate:
            logger.info(f"Skipping duplicate textbook: {tb.filename} (Identical to {tb.canonical_textbook_id})")
            continue

        pdf_file = scan_dir / tb.filename
        if not pdf_file.exists():
            # Search recursively in scan_dir
            matches = list(scan_dir.rglob(tb.filename))
            if matches:
                pdf_file = matches[0]

        if not pdf_file.exists():
            logger.warning(f"File not found on disk: {tb.filename}")
            continue

        logger.info(f"Extracting chapters for: {tb.filename} (Class {tb.class_level} {tb.subject})")
        chapters = extractor.extract_chapters(tb, pdf_file)
        logger.info(f"  -> Found {len(chapters)} chapters in {tb.filename}")

        if pilot_mode:
            chapters = chapters[:1]
            logger.info(f"  -> Pilot Mode: limiting to first chapter: '{chapters[0].chapter_title}'")
        elif limit_chapters_per_book:
            chapters = chapters[:limit_chapters_per_book]

        all_chapter_records.extend(chapters)

    chapter_inv = ChapterInventory(
        chapters=all_chapter_records,
        total_chapters=len(all_chapter_records),
        generated_at=textbook_inv.generated_at
    )

    # 4. Phase 3, 4, 5, 6: Summary, Mind Map, Quiz Generation & Validation
    logger.info(f"\n[PHASE 3, 4, 5, 6] Generating educational resources for {len(all_chapter_records)} chapters...")
    validation_details = []
    errors_list = []

    for idx, chapter in enumerate(all_chapter_records, start=1):
        logger.info(f"[{idx}/{len(all_chapter_records)}] Processing Chapter: '{chapter.chapter_title}' ({chapter.chapter_id})")

        # Check Cache
        cached_summary, cached_mm, cached_quiz = None, None, None
        if not force_regenerate and cache_mgr.is_chapter_completed(chapter.chapter_id):
            cached_summary, cached_mm, cached_quiz = cache_mgr.load_cached_chapter(chapter.chapter_id)
            if cached_summary and cached_mm and cached_quiz:
                logger.info(f"  -> Loaded from cache: {chapter.chapter_id}")
                is_valid, val_detail = validator.validate_chapter_bundle(
                    chapter_id=chapter.chapter_id,
                    mindmap=cached_mm,
                    quiz=cached_quiz,
                    summary=cached_summary,
                    subject=chapter.subject
                )
                validation_details.append(val_detail)
                exporter.export_chapter_bundle(chapter, cached_summary, cached_mm, cached_quiz)
                continue

        # Generate fresh content
        summary, mindmap, quiz, is_valid, gen_errors = generator.generate_all_for_chapter(chapter)

        if is_valid and summary and mindmap and quiz:
            logger.info(f"  -> Successfully generated & validated 20 questions and mind map for '{chapter.chapter_title}'")
            # Cache output
            cache_mgr.save_chapter_to_cache(chapter, summary, mindmap, quiz)
            # Export to target structure
            exporter.export_chapter_bundle(chapter, summary, mindmap, quiz)
            val_detail = validator.validate_chapter_bundle(
                chapter.chapter_id, mindmap, quiz, summary, chapter.subject
            )[1]
            validation_details.append(val_detail)
        else:
            logger.warning(f"  -> Chapter '{chapter.chapter_title}' needs review. Errors: {gen_errors}")
            errors_list.append({"chapter_id": chapter.chapter_id, "errors": gen_errors})
            if summary and mindmap and quiz:
                exporter.export_chapter_bundle(chapter, summary, mindmap, quiz)
                val_detail = validator.validate_chapter_bundle(
                    chapter.chapter_id, mindmap, quiz, summary, chapter.subject
                )[1]
                val_detail.overall_status = "needs_review"
                validation_details.append(val_detail)

    # 5. Phase 10 & 13: Build Reports
    logger.info("\n[PHASE 10 & 13] Compiling comprehensive generation and validation reports...")
    gen_report = ReportBuilder.build_generation_report(
        textbook_inv=textbook_inv,
        chapter_records=all_chapter_records,
        validation_details=validation_details,
        token_usage=gemini_client.token_usage,
        errors=errors_list
    )
    val_report = ReportBuilder.build_validation_report(validation_details)

    # 6. Phase 9 & 12: Export Reports and Package ZIP
    logger.info(f"\n[PHASE 9 & 12] Exporting datasets and reports to: {output_dir}")
    exporter.export_root_reports(textbook_inv, chapter_inv, gen_report, val_report)

    logger.info(f"Creating distribution ZIP archive: {output_zip}")
    zip_path = exporter.create_zip_archive()

    logger.info("\n" + "=" * 60)
    logger.info("VIDYAFLOW PIPELINE EXECUTION SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Textbooks Discovered:      {gen_report.total_pdfs_discovered}")
    logger.info(f"Chapters Processed:        {len(all_chapter_records)}")
    logger.info(f"Chapters Validated (100%): {val_report.total_passed}")
    logger.info(f"Chapters Requiring Review: {val_report.total_needs_review}")
    logger.info(f"Total Validated MCQs:      {gen_report.total_questions_validated}")
    logger.info(f"Final Output ZIP:          {zip_path} ({zip_path.stat().st_size / 1024:.1f} KB)")
    logger.info("=" * 60)

    return 0 if val_report.total_failed == 0 else 1


def main():
    parser = argparse.ArgumentParser(
        description="VidyaFlow - Automated Textbook to Mind Map & Quiz Bank Dataset Generator"
    )
    parser.add_argument(
        "--input", "-i",
        dest="input_path",
        default=str(DEFAULT_INPUT_DIR),
        help="Path to input ZIP archive or directory containing textbook PDFs"
    )
    parser.add_argument(
        "--output-dir", "-o",
        dest="output_dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Path to target directory for generated VidyaFlow content"
    )
    parser.add_argument(
        "--output-zip", "-z",
        dest="output_zip",
        default=str(DEFAULT_OUTPUT_ZIP),
        help="Path to target ZIP archive"
    )
    parser.add_argument(
        "--pilot",
        action="store_true",
        help="Run pilot mode on 1 chapter to verify pipeline end-to-end"
    )
    parser.add_argument(
        "--class",
        dest="target_class",
        type=int,
        choices=[6, 7, 8, 9, 10],
        help="Filter generation to a specific class (6, 7, 8, 9, 10)"
    )
    parser.add_argument(
        "--subject",
        dest="target_subject",
        type=str,
        help="Filter generation to a specific subject (e.g. Mathematics, Science)"
    )
    parser.add_argument(
        "--limit-chapters",
        dest="limit_chapters",
        type=int,
        help="Limit number of chapters to process per textbook"
    )
    parser.add_argument(
        "--offline",
        action="store_true",
        help="Force offline deterministic extraction without invoking Gemini API"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-generation and ignore cached chapter outputs"
    )
    parser.add_argument(
        "--model",
        type=str,
        help=f"Gemini model override (default: {DEFAULT_MODEL})"
    )

    args = parser.parse_args()

    exit_code = run_pipeline(
        input_path=Path(args.input_path),
        output_dir=Path(args.output_dir),
        output_zip=Path(args.output_zip),
        pilot_mode=args.pilot,
        target_class=args.target_class,
        target_subject=args.target_subject,
        limit_chapters_per_book=args.limit_chapters,
        force_offline=args.offline,
        force_regenerate=args.force,
        model_name=args.model
    )
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
