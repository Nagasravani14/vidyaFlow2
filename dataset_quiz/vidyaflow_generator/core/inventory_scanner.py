"""Phase One: PDF Inventory Scanner and Metadata Discovery."""
import os
import re
import hashlib
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Union
import pypdf

from vidyaflow_generator.models.inventory import TextbookRecord, TextbookInventory
from vidyaflow_generator.config import (
    DEFAULT_BOARD,
    DEFAULT_LANGUAGE,
    MIN_CHARS_PER_PAGE_THRESHOLD,
)

ROMAN_NUMERAL_MAP = {
    "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5,
    "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10,
    "XI": 11, "XII": 12
}


def compute_file_sha256(file_path: Union[str, Path]) -> str:
    """Compute SHA256 checksum of a file."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


class InventoryScanner:
    """Discovers, inventories, and characterizes all PDF textbooks in an input ZIP or folder."""

    def __init__(self, work_dir: Optional[Path] = None):
        self.work_dir = Path(work_dir) if work_dir else Path.cwd()

    def extract_zip_if_needed(self, input_path: Union[str, Path], extract_target_dir: Optional[Path] = None) -> Path:
        """Extract input ZIP archive if a ZIP file path is provided; returns directory to scan."""
        path = Path(input_path)
        if path.is_file() and path.suffix.lower() == ".zip":
            target_dir = extract_target_dir or (path.parent / f"{path.stem}_extracted")
            target_dir.mkdir(parents=True, exist_ok=True)
            with zipfile.ZipFile(path, "r") as archive:
                archive.extractall(target_dir)
            return target_dir
        elif path.is_dir():
            return path
        else:
            raise ValueError(f"Input path '{input_path}' is neither a valid directory nor a ZIP archive.")

    def scan_directory(self, root_dir: Union[str, Path]) -> TextbookInventory:
        """Recursively scan directory for PDF files and generate the complete inventory."""
        root = Path(root_dir)
        pdf_files = sorted(list(root.rglob("*.pdf")))
        textbooks: List[TextbookRecord] = []
        seen_hashes: Dict[str, str] = {}  # sha256 -> textbook_id
        total_pages = 0

        for pdf_path in pdf_files:
            # Skip temp or hidden files
            if pdf_path.name.startswith(".") or pdf_path.name.startswith("~$"):
                continue

            record = self._analyze_pdf(pdf_path, root, seen_hashes)
            if record:
                textbooks.append(record)
                total_pages += record.page_count
                if not record.is_duplicate and record.file_sha256:
                    seen_hashes[record.file_sha256] = record.textbook_id

        inventory = TextbookInventory(
            textbooks=textbooks,
            total_textbooks=len(textbooks),
            total_pages=total_pages,
            generated_at=datetime.now(timezone.utc).isoformat()
        )
        return inventory

    def _analyze_pdf(
        self,
        pdf_path: Path,
        root_dir: Path,
        seen_hashes: Dict[str, str]
    ) -> Optional[TextbookRecord]:
        """Deep analysis of a single PDF file extracting metadata, board, class, and quality."""
        try:
            reader = pypdf.PdfReader(str(pdf_path))
            page_count = len(reader.pages)
        except Exception as e:
            # Record failed/corrupt PDF
            sha = compute_file_sha256(pdf_path) if pdf_path.exists() else "unknown"
            return TextbookRecord(
                textbook_id=self._generate_textbook_id(pdf_path.name, 0, "Unknown"),
                filename=pdf_path.name,
                class_level=6,  # default fallback
                board="Unknown Board",
                subject="Unknown",
                language="Unknown",
                edition=None,
                page_count=0,
                extraction_quality="unreadable",
                is_scanned=False,
                ocr_required=True,
                file_sha256=sha,
                extraction_status="failed"
            )

        # Compute hash for duplicate tracking
        file_sha = compute_file_sha256(pdf_path)
        is_dup = file_sha in seen_hashes
        canonical_id = seen_hashes.get(file_sha)

        # Sample front pages to inspect text quality, board, class, and subject
        front_text = ""
        total_sample_chars = 0
        sample_page_count = min(10, page_count)

        for i in range(sample_page_count):
            try:
                page_text = reader.pages[i].extract_text() or ""
                front_text += "\n" + page_text
                total_sample_chars += len(page_text.strip())
            except Exception:
                pass

        avg_chars_per_sample = total_sample_chars / max(1, sample_page_count)
        is_scanned = avg_chars_per_sample < MIN_CHARS_PER_PAGE_THRESHOLD
        ocr_required = is_scanned
        quality = "high" if avg_chars_per_sample > 500 else ("medium" if avg_chars_per_sample > 100 else ("low" if avg_chars_per_sample > 20 else "unreadable"))

        # Determine Class
        class_level = self._detect_class(pdf_path, front_text)

        # Determine Subject
        subject = self._detect_subject(pdf_path, front_text)

        # Determine Board
        board = self._detect_board(front_text)

        # Determine Language
        language = self._detect_language(pdf_path, front_text)

        # Determine Edition
        edition = self._detect_edition(pdf_path, front_text)

        textbook_id = self._generate_textbook_id(pdf_path.name, class_level, subject)

        return TextbookRecord(
            textbook_id=textbook_id,
            filename=pdf_path.name,
            class_level=class_level,
            board=board,
            subject=subject,
            language=language,
            edition=edition,
            page_count=page_count,
            extraction_quality=quality,
            is_scanned=is_scanned,
            ocr_required=ocr_required,
            is_duplicate=is_dup,
            canonical_textbook_id=canonical_id,
            file_sha256=file_sha,
            extraction_status="completed" if not is_scanned else "needs_review"
        )

    def _detect_class(self, pdf_path: Path, front_text: str) -> int:
        """Detect class (6-10) using filename, directory paths, and front matter content."""
        search_target = f"{pdf_path.parent.name} {pdf_path.name} {front_text[:2000]}".upper()

        # Check explicit patterns like "CLASS VI", "CLASS 6", "GRADE 8"
        class_patterns = [
            r"\bCLASS\s*[-_:]?\s*(VIII|VII|VI|IX|X|XI|XII|10|9|8|7|6)\b",
            r"\bGRADE\s*[-_:]?\s*(VIII|VII|VI|IX|X|XI|XII|10|9|8|7|6)\b",
            r"\b(VIII|VII|VI|IX|X)\s+CLASS\b",
            r"\b([6-9]|10)TH\s+CLASS\b",
            r"\b([6-9]|10)TH\b",
            r"\b(VIII|VII|VI|IX|X)\b",
            r"\b([6-9]|10)\b",
        ]

        for pattern in class_patterns:
            m = re.search(pattern, search_target)
            if m:
                val = m.group(1)
                if val in ROMAN_NUMERAL_MAP:
                    return ROMAN_NUMERAL_MAP[val]
                if val.isdigit():
                    num = int(val)
                    if 6 <= num <= 10:
                        return num

        # Default fallback
        return 8

    def _detect_subject(self, pdf_path: Path, front_text: str) -> str:
        """Detect subject with fine-grained scientific and social subjects."""
        search_target = f"{pdf_path.parent.name} {pdf_path.name} {front_text[:2500]}".upper()

        if re.search(r"\b(PHYSICAL\s+SCIENCE|PHYSICS)\b", search_target):
            return "Physical Science"
        if re.search(r"\b(BIOLOGICAL\s+SCIENCE|BIOLOGY)\b", search_target):
            return "Biological Science"
        if re.search(r"\b(GEN(ERAL)?\.?\s*SCIENCE|SCIENCE)\b", search_target):
            return "General Science"
        if re.search(r"\b(MATH|MATHEMATICS|MATHS)\b", search_target):
            return "Mathematics"
        if re.search(r"\b(SOCIAL\s+STUDIES|SOCIAL\s+SCIENCE|SOCIAL)\b", search_target):
            return "Social Studies"

        return "General"

    def _detect_board(self, front_text: str) -> str:
        """Identify educational board from front pages."""
        text_upper = front_text.upper()
        if "SCERT" in text_upper or "TELANGANA" in text_upper or "T.S. GOVERNMENT" in text_upper:
            return "Telangana State Board (SCERT)"
        if "NCERT" in text_upper or "CBSE" in text_upper:
            return "CBSE"
        if "ICSE" in text_upper or "CISCE" in text_upper:
            return "ICSE"
        return DEFAULT_BOARD

    def _detect_language(self, pdf_path: Path, front_text: str) -> str:
        """Identify medium of instruction."""
        search_target = f"{pdf_path.name} {front_text[:1000]}".upper()
        if " EM" in search_target or "_EM" in search_target or "ENGLISH MEDIUM" in search_target:
            return "English"
        if " TM" in search_target or "_TM" in search_target or "TELUGU MEDIUM" in search_target:
            return "Telugu"
        if " HM" in search_target or "_HM" in search_target or "HINDI MEDIUM" in search_target:
            return "Hindi"
        return DEFAULT_LANGUAGE

    def _detect_edition(self, pdf_path: Path, front_text: str) -> Optional[str]:
        """Detect academic edition or year."""
        combined = f"{pdf_path.name} {front_text[:3000]}"
        m = re.search(r"\b(202\d[-–]\d{2,4})\b", combined)
        if m:
            return m.group(1)
        m2 = re.search(r"\b(202[0-9])\b", combined)
        if m2:
            return m2.group(1)
        return "2026-27"

    def _generate_textbook_id(self, filename: str, class_level: int, subject: str) -> str:
        """Generate stable textbook ID."""
        clean_name = re.sub(r"[^a-zA-Z0-9]+", "_", filename.lower()).strip("_")
        subj_clean = re.sub(r"[^a-zA-Z0-9]+", "_", subject.lower()).strip("_")
        return f"class_{class_level}_{subj_clean}_{clean_name}"
