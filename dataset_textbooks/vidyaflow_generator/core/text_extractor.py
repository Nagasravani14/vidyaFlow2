"""Phase Two: PDF Text Extraction, TOC Detection, and Chapter Boundary Detection."""
import re
import logging
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Any
import pypdf

from vidyaflow_generator.models.inventory import TextbookRecord, ChapterRecord
from vidyaflow_generator.core.ocr_engine import OCREngine
from vidyaflow_generator.config import EXTRACTED_CHAPTERS_DIR

logger = logging.getLogger(__name__)

# Suppress pypdf stream warnings
logging.getLogger("pypdf").setLevel(logging.ERROR)


class TextExtractor:
    """Extracts text page-by-page, detects chapter boundaries from TOC, and removes headers/footers."""

    def __init__(self, ocr_engine: Optional[OCREngine] = None, output_dir: Optional[Path] = None):
        self.ocr_engine = ocr_engine or OCREngine()
        self.output_dir = Path(output_dir) if output_dir else EXTRACTED_CHAPTERS_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def extract_chapters(
        self,
        textbook: TextbookRecord,
        pdf_path: Path
    ) -> List[ChapterRecord]:
        """Extract all chapters for a given textbook PDF."""
        try:
            reader = pypdf.PdfReader(str(pdf_path))
        except Exception as e:
            logger.error(f"Cannot read PDF {pdf_path}: {e}")
            return []

        total_pages = len(reader.pages)
        if total_pages == 0:
            return []

        # 1. Detect Chapter Boundaries from Table of Contents or In-Document Headings
        raw_chapters = self._detect_chapter_boundaries(reader, textbook, total_pages)

        if not raw_chapters:
            # Fallback: Treat entire textbook or large contiguous blocks as chapters
            logger.warning(f"No TOC boundaries found for {pdf_path.name}; using fallback full-document chapter.")
            raw_chapters = [{
                "chapter_number": 1,
                "chapter_title": textbook.subject,
                "start_page": 1,
                "end_page": min(total_pages, 50),
                "pdf_start_page": 1,
                "pdf_end_page": total_pages
            }]

        chapter_records: List[ChapterRecord] = []

        for ch in raw_chapters:
            ch_num = ch["chapter_number"]
            ch_title = ch["chapter_title"]
            sp = ch["start_page"]
            ep = ch["end_page"]
            pdf_sp = ch["pdf_start_page"]
            pdf_ep = ch["pdf_end_page"]

            # Clamp PDF bounds
            pdf_sp = max(1, min(pdf_sp, total_pages))
            pdf_ep = max(pdf_sp, min(pdf_ep, total_pages))

            # Extract text across page range
            extracted_pages: List[str] = []
            has_ocr = False
            needs_review = False

            for p_num in range(pdf_sp, pdf_ep + 1):
                raw_page_text = ""
                try:
                    raw_page_text = reader.pages[p_num - 1].extract_text() or ""
                except Exception as e:
                    logger.warning(f"Error extracting page {p_num} in {pdf_path.name}: {e}")

                # Run OCR fallback if needed
                page_text, ocr_applied, ocr_status = self.ocr_engine.process_page_if_needed(
                    raw_page_text, p_num, pdf_path
                )
                if ocr_applied:
                    has_ocr = True
                if ocr_status == "ocr_tool_missing_needs_review" or ocr_status == "ocr_low_confidence":
                    needs_review = True

                # Clean header / footer
                cleaned_page = self._clean_headers_footers(page_text, ch_title)
                # Annotate page boundary clearly for source provenance
                page_block = f"--- [PAGE {p_num} | Printed Page {sp + (p_num - pdf_sp)}] ---\n{cleaned_page}"
                extracted_pages.append(page_block)

            full_chapter_text = "\n\n".join(extracted_pages).strip()
            chapter_id = self._generate_chapter_id(textbook.class_level, textbook.subject, ch_num, ch_title)

            status = "completed"
            if needs_review or len(full_chapter_text) < 200:
                status = "needs_review"

            record = ChapterRecord(
                chapter_id=chapter_id,
                textbook_id=textbook.textbook_id,
                board=textbook.board,
                class_level=textbook.class_level,
                subject=textbook.subject,
                chapter_number=ch_num,
                chapter_title=ch_title,
                source_pdf=textbook.filename,
                start_page=sp,
                end_page=ep,
                pdf_start_page=pdf_sp,
                pdf_end_page=pdf_ep,
                extracted_text=full_chapter_text,
                char_count=len(full_chapter_text),
                extraction_status=status
            )
            chapter_records.append(record)

            # Save extracted chapter text to output/extracted_chapters/
            self._save_extracted_chapter(record)

        return chapter_records

    def _detect_chapter_boundaries(
        self,
        reader: pypdf.PdfReader,
        textbook: TextbookRecord,
        total_pages: int
    ) -> List[Dict[str, Any]]:
        """Detect chapters and calculate their physical PDF page ranges."""
        # 1. Locate printed page 1 offset (usually around physical page 9 to 13 in SCERT books)
        pdf_offset = self._find_printed_page_1_offset(reader, total_pages)

        # 2. Extract TOC text from first 16 pages
        toc_lines: List[str] = []
        for p_idx in range(min(16, total_pages)):
            txt = reader.pages[p_idx].extract_text() or ""
            if any(k in txt.lower() for k in ["contents", "index", "table of contents"]):
                toc_lines.extend([l.strip() for l in txt.splitlines() if l.strip()])

        chapters: List[Dict[str, Any]] = []

        # Strategy 1: Standard Range Pattern (e.g. '01 Real Numbers 15 June 1 - 27' or '1. Whole Numbers 16 - 28')
        for line in toc_lines:
            lower_l = line.lower()
            if any(w in lower_l for w in ['contents', 'index', 'syllabus', 's.no', 'scert', 'revision', 'answers', 'appendix']):
                continue

            # Pattern 1A: With explicit chapter number
            m1 = re.search(r'^(?:CHAPTER\s+)?(\d{1,2})\.?\s+(.+?)(?:\s+\d{1,2}\s+(?:June|July|August|September|October|November|December|Jan|Feb|March)[a-z/,\s]*)?\s+(\d{1,3})\s*[-–]\s*(\d{1,3})', line, re.I)
            if m1:
                ch_num = int(m1.group(1))
                raw_title = m1.group(2).strip()
                sp = int(m1.group(3))
                ep = int(m1.group(4))
                title = re.sub(r'\s+(?:June|July|August|September|October|November|December|January|February|March|Periods|Month)[a-z/,\s]*$', '', raw_title, flags=re.I).strip()
                title = re.sub(r'\s+\d{1,2}$', '', title).strip()
                if len(title) > 2:
                    chapters.append({
                        "chapter_number": ch_num,
                        "chapter_title": title,
                        "start_page": sp,
                        "end_page": ep,
                        "pdf_start_page": sp + pdf_offset,
                        "pdf_end_page": ep + pdf_offset
                    })
                continue

            # Pattern 1B: Title without explicit chapter number (e.g. 'Rational Numbers June 1-36')
            m2 = re.search(r'^([A-Za-z\s,\-–\(\)\':\?]+?)(?:\s+(?:June|July|August|September|October|November|December|Jan|Feb|March)[a-z/,\s]*)?\s+(\d{1,3})\s*[-–]\s*(\d{1,3})', line, re.I)
            if m2:
                raw_title = m2.group(1).strip()
                sp = int(m2.group(2))
                ep = int(m2.group(3))
                title = re.sub(r'\s+(?:June|July|August|September|October|November|December|January|February|March)[a-z/,\s]*$', '', raw_title, flags=re.I).strip()
                if len(title) > 2:
                    chapters.append({
                        "chapter_number": len(chapters) + 1,
                        "chapter_title": title,
                        "start_page": sp,
                        "end_page": ep,
                        "pdf_start_page": sp + pdf_offset,
                        "pdf_end_page": ep + pdf_offset
                    })

        # Strategy 2: Science Single Page Pattern (e.g., '1. Our food 1 10 June' or '2 Playing with magnets 11 12 June')
        if len(chapters) < 3:
            single_p_chapters = []
            for line in toc_lines:
                m_single = re.search(r'^(\d{1,2})\.?\s+([A-Za-z\s,\-–\(\)\':\?]{3,50})\s+(\d{1,3})\s+\d{1,2}\s+(?:June|July|August|September|October|November|December|Jan|Feb|March)', line, re.I)
                if m_single:
                    num = int(m_single.group(1))
                    t = m_single.group(2).strip()
                    sp = int(m_single.group(3))
                    single_p_chapters.append({"num": num, "title": t, "start_page": sp})

            if len(single_p_chapters) >= 3:
                for idx, sc in enumerate(single_p_chapters):
                    next_sp = single_p_chapters[idx + 1]["start_page"] if idx + 1 < len(single_p_chapters) else (sc["start_page"] + 15)
                    ep = max(sc["start_page"], next_sp - 1)
                    chapters.append({
                        "chapter_number": sc["num"],
                        "chapter_title": sc["title"],
                        "start_page": sc["start_page"],
                        "end_page": ep,
                        "pdf_start_page": sc["start_page"] + pdf_offset,
                        "pdf_end_page": ep + pdf_offset
                    })

        # Strategy 3: Science Table Column matching (e.g. Physics / Biology / Physical Science)
        if len(chapters) < 3:
            pnums = []
            titles = []
            for line in toc_lines:
                # Month followed by page number
                m_p = re.search(r'(?:June|July|August|September|October|November|December|Jan|Feb|March)[a-z/,\s]*\s+(\d{1,3})$', line, re.I)
                if m_p:
                    pnums.append(int(m_p.group(1)))
                m_t = re.match(r'^(?:[0-9]{1,2}\s+)?([A-Za-z][A-Za-z\s\-–\(\)\':\?]{3,50})(?:\s+\d{1,3}\s+\d{1,2}\s+(?:June|July|August|September|October|November|December|Jan|Feb|March))?$', line, re.I)
                if m_t and not any(w in line.lower() for w in ['index', 'contents', 'page', 'periods', 'month', 's.no', 'scert', 'viii', 'vii', 'vi', 'ix', 'x']):
                    raw = m_t.group(1).strip()
                    if raw not in ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'March']:
                        titles.append(raw)

            # Deduplicate preserving order
            clean_pnums = sorted(list(set([p for p in pnums if 1 <= p <= total_pages])))
            if len(clean_pnums) >= 4:
                # Match clean_pnums to titles or extract titles from first page of each chapter
                for idx, sp in enumerate(clean_pnums):
                    ep = clean_pnums[idx + 1] - 1 if idx + 1 < len(clean_pnums) else (sp + 15)
                    title = titles[idx] if idx < len(titles) else self._extract_title_from_page(reader, sp + pdf_offset)
                    chapters.append({
                        "chapter_number": idx + 1,
                        "chapter_title": title,
                        "start_page": sp,
                        "end_page": ep,
                        "pdf_start_page": sp + pdf_offset,
                        "pdf_end_page": ep + pdf_offset
                    })

        return chapters

    def _find_printed_page_1_offset(self, reader: pypdf.PdfReader, total_pages: int) -> int:
        """Find the physical PDF page offset where printed page 1 begins."""
        # Check pages 7 to 15
        for p in range(6, min(15, total_pages)):
            txt = reader.pages[p].extract_text() or ""
            # Often begins with '1. ' or '1 ' or 'Chapter 1' or 'Government\'s Gift... 1'
            if re.search(r"(?:Government'?s Gift.*?1\s*[A-Za-z]|1\s+[A-Z\s]{4,}|CHAPTER\s+1\b|1\.1\s+INTRODUCTION)", txt, re.I):
                # physical page is p + 1; printed page is 1 -> offset = p
                return p
        # Default offset for Telangana textbooks is 10 (PDF page 11 = printed page 1)
        return 10

    def _extract_title_from_page(self, reader: pypdf.PdfReader, pdf_page_num: int) -> str:
        """Extract chapter title directly from the chapter start page."""
        try:
            txt = (reader.pages[pdf_page_num - 1].extract_text() or "")[:400]
            # Pattern like 'Government\'s Gift for students\' progress 1Force' -> 'Force'
            m1 = re.search(r"Government'?s Gift[^\n\d]*\d+\s*([A-Za-z\s\-–\(\)\':\?]{3,40})", txt, re.I)
            if m1:
                return m1.group(1).strip()
            # Pattern like '1 KNOWING OUR NUMBERS'
            m2 = re.search(r"^\s*\d{1,2}\s*([A-Z\s\-–\(\)\':\?]{4,40})\s*\n", txt, re.M)
            if m2:
                return m2.group(1).strip().title()
        except Exception:
            pass
        return "General Chapter"

    def _clean_headers_footers(self, text: str, chapter_title: str) -> str:
        """Remove repetitive boilerplate headers and footers."""
        lines = text.splitlines()
        cleaned_lines = []
        for line in lines:
            stripped = line.strip()
            # Remove state / publisher boilerplate
            if re.match(r"^(?:SCERT|TELANGANA|GOVERNMENT'?S GIFT FOR STUDENTS'? PROGRESS|FREE DISTRIBUTION BY T\.?S\.? GOVERNMENT)\b", stripped, re.I):
                continue
            if stripped.endswith("SCERT, TELANGANA"):
                stripped = stripped.replace("SCERT, TELANGANA", "").strip()
            # Remove isolated page numbers
            if re.match(r"^\d{1,3}$", stripped):
                continue
            cleaned_lines.append(stripped)

        return "\n".join(cleaned_lines)

    def _generate_chapter_id(self, class_level: int, subject: str, chapter_num: int, title: str) -> str:
        """Generate stable unique chapter ID."""
        clean_subj = re.sub(r"[^a-zA-Z0-9]+", "_", subject.lower()).strip("_")
        clean_title = re.sub(r"[^a-zA-Z0-9]+", "_", title.lower()).strip("_")[:30]
        return f"class_{class_level}_{clean_subj}_ch{chapter_num:02d}_{clean_title}"

    def _save_extracted_chapter(self, record: ChapterRecord):
        """Save extracted chapter record and raw text under output/extracted_chapters/."""
        ch_dir = self.output_dir / record.chapter_id
        ch_dir.mkdir(parents=True, exist_ok=True)

        meta_path = ch_dir / "metadata.json"
        text_path = ch_dir / "extracted_text.txt"

        meta_path.write_text(record.model_dump_json(indent=2, by_alias=True), encoding="utf-8")
        text_path.write_text(record.extracted_text, encoding="utf-8")
