"""Phase Nine and Twelve: Output Directory Structure and ZIP Packager."""
import json
import zipfile
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

from vidyaflow_generator.models.inventory import TextbookInventory, ChapterInventory, ChapterRecord
from vidyaflow_generator.models.summary import ChapterSummary
from vidyaflow_generator.models.mindmap import MindMapData
from vidyaflow_generator.models.quiz import QuizBank
from vidyaflow_generator.models.report import GenerationReport, ValidationReport
from vidyaflow_generator.config import DEFAULT_OUTPUT_DIR, DEFAULT_OUTPUT_ZIP

logger = logging.getLogger(__name__)


class ContentExporter:
    """Exports generated educational datasets into clean hierarchical folders and creates the distribution ZIP."""

    def __init__(self, output_dir: Optional[Path] = None, output_zip: Optional[Path] = None):
        self.output_dir = Path(output_dir) if output_dir else DEFAULT_OUTPUT_DIR
        self.output_zip = Path(output_zip) if output_zip else DEFAULT_OUTPUT_ZIP

    def export_chapter_bundle(
        self,
        chapter: ChapterRecord,
        summary: ChapterSummary,
        mindmap: MindMapData,
        quiz: QuizBank
    ) -> Path:
        """Writes a chapter bundle into vidyaflow_generated_content/class_X/subject/chapter_YY/."""
        class_folder = f"class_{chapter.class_level}"
        subject_folder = chapter.subject.lower().replace(" ", "_")
        chapter_folder = f"chapter_{chapter.chapter_number:02d}"

        target_dir = self.output_dir / class_folder / subject_folder / chapter_folder
        target_dir.mkdir(parents=True, exist_ok=True)

        # 1. metadata.json
        meta_dict = chapter.model_dump(by_alias=True)
        # Avoid storing extracted_text inside metadata.json since it has its own file
        meta_dict.pop("extracted_text", None)
        (target_dir / "metadata.json").write_text(json.dumps(meta_dict, indent=2), encoding="utf-8")

        # 2. extracted_text.txt
        (target_dir / "extracted_text.txt").write_text(chapter.extracted_text, encoding="utf-8")

        # 3. summary.json
        (target_dir / "summary.json").write_text(summary.model_dump_json(indent=2, by_alias=True), encoding="utf-8")

        # 4. mindmap.json
        (target_dir / "mindmap.json").write_text(mindmap.model_dump_json(indent=2, by_alias=True), encoding="utf-8")

        # 5. quiz.json
        (target_dir / "quiz.json").write_text(quiz.model_dump_json(indent=2, by_alias=True), encoding="utf-8")

        return target_dir

    def export_root_reports(
        self,
        textbook_inv: TextbookInventory,
        chapter_inv: ChapterInventory,
        gen_report: GenerationReport,
        val_report: ValidationReport,
        readme_content: Optional[str] = None
    ):
        """Writes inventory and report files at the root of the output directory."""
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # 1. textbook_inventory.json
        (self.output_dir / "textbook_inventory.json").write_text(
            textbook_inv.model_dump_json(indent=2, by_alias=True), encoding="utf-8"
        )

        # 2. chapter_inventory.json
        (self.output_dir / "chapter_inventory.json").write_text(
            chapter_inv.model_dump_json(indent=2, by_alias=True), encoding="utf-8"
        )

        # 3. generation_report.json
        (self.output_dir / "generation_report.json").write_text(
            gen_report.model_dump_json(indent=2, by_alias=True), encoding="utf-8"
        )

        # 4. validation_report.json
        (self.output_dir / "validation_report.json").write_text(
            val_report.model_dump_json(indent=2, by_alias=True), encoding="utf-8"
        )

        # 5. README.md
        if not readme_content:
            readme_content = self._generate_default_readme(textbook_inv, gen_report, val_report)
        (self.output_dir / "README.md").write_text(readme_content, encoding="utf-8")

    def create_zip_archive(self) -> Path:
        """
        Packs the output directory into vidyaflow_generated_content.zip.
        Strictly excludes any .env or credential files.
        """
        if self.output_zip.exists():
            self.output_zip.unlink()

        with zipfile.ZipFile(self.output_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
            for file_path in sorted(list(self.output_dir.rglob("*"))):
                if file_path.is_file():
                    # Security checks: Never include .env or key files
                    if file_path.name.startswith(".env") or file_path.suffix in [".key", ".pem"]:
                        continue

                    archive_rel_path = file_path.relative_to(self.output_dir.parent)
                    zipf.write(file_path, arcname=str(archive_rel_path).replace("\\", "/"))

        logger.info(f"Successfully generated ZIP archive at: {self.output_zip}")
        return self.output_zip

    def _generate_default_readme(
        self,
        textbook_inv: TextbookInventory,
        gen_report: GenerationReport,
        val_report: ValidationReport
    ) -> str:
        """Generates README.md explaining the generated dataset structure."""
        return f"""# VidyaFlow Educational Platform - Generated Textbook Dataset

## Overview
This archive contains automated textbook curriculum extractions, structured interactive mind maps, and rigorously validated 20-question quiz banks generated for the **VidyaFlow** educational platform.

## Summary Statistics
- **Total Textbooks Discovered:** {gen_report.total_pdfs_discovered}
- **Total Textbooks Successfully Extracted:** {gen_report.total_pdfs_extracted}
- **Total Chapters Mapped:** {gen_report.total_chapters_mapped}
- **Total Questions Validated:** {gen_report.total_questions_validated}
- **Chapters Passed Validation:** {val_report.total_passed}
- **Chapters Requiring Review:** {val_report.total_needs_review}
- **Generated At:** {gen_report.generated_at}

## Directory Organization
```
vidyaflow_generated_content/
├── class_6/
│   ├── mathematics/
│   │   ├── chapter_01/
│   │   │   ├── metadata.json       # Chapter provenance, source page range, IDs
│   │   │   ├── extracted_text.txt  # Cleaned, extracted textbook chapter text
│   │   │   ├── summary.json        # Structured educational summary and formulas
│   │   │   ├── mindmap.json        # Interactive 3-level mind map JSON tree
│   │   │   └── quiz.json           # Exactly 20 validated MCQs (7 Easy, 8 Med, 5 Hard)
...
├── textbook_inventory.json         # Complete audit log of all discovered PDFs
├── chapter_inventory.json          # Dataset of all detected chapters and offsets
├── generation_report.json          # Coverage, statistics, and hierarchy
├── validation_report.json          # Strict compliance and mathematical verification details
└── README.md                       # This documentation
```

## Ready for VidyaFlow Integration
All schemas strictly align with VidyaFlow platform interfaces:
- Mind maps are nested JSON trees directly renderable by React mind-map graph visualizers.
- Quizzes contain exactly 20 questions with 4 distinct options (A, B, C, D) and concept-level links.
- Provenance is preserved with source page references, textbook IDs, and chapter IDs.
"""
