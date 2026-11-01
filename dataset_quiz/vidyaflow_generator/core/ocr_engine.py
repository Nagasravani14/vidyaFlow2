"""Phase Two fallback: Optical Character Recognition (OCR) Engine."""
import logging
from typing import Tuple, Optional
from pathlib import Path
from vidyaflow_generator.config import MIN_CHARS_PER_PAGE_THRESHOLD

logger = logging.getLogger(__name__)


class OCREngine:
    """Detects pages needing OCR, attempts OCR extraction if tools are present, or flags for review."""

    def __init__(self):
        self._tesseract_available: Optional[bool] = None

    def is_ocr_available(self) -> bool:
        """Check if pytesseract and an OCR engine are available on the current machine."""
        if self._tesseract_available is not None:
            return self._tesseract_available
        try:
            import pytesseract
            # Test simple call
            pytesseract.get_tesseract_version()
            self._tesseract_available = True
        except Exception:
            self._tesseract_available = False
        return self._tesseract_available

    def process_page_if_needed(self, extracted_text: str, page_number: int, pdf_path: Path) -> Tuple[str, bool, str]:
        """
        Examines extracted page text. If text is below threshold, attempts OCR fallback.
        Returns:
            (final_text, ocr_applied, status)
            status can be: 'text_ok', 'ocr_success', 'ocr_low_confidence', 'ocr_tool_missing_needs_review'
        """
        cleaned = (extracted_text or "").strip()
        if len(cleaned) >= MIN_CHARS_PER_PAGE_THRESHOLD:
            return extracted_text, False, "text_ok"

        # Text is sparse or empty; check if OCR is available
        if not self.is_ocr_available():
            logger.warning(
                f"Page {page_number} in {pdf_path.name} has only {len(cleaned)} characters, "
                f"and Tesseract OCR is not installed. Flagging for manual review."
            )
            return extracted_text, False, "ocr_tool_missing_needs_review"

        # Attempt OCR
        try:
            import pytesseract
            from pdf2image import convert_from_path

            images = convert_from_path(str(pdf_path), first_page=page_number, last_page=page_number)
            if images:
                ocr_text = pytesseract.image_to_string(images[0])
                if len(ocr_text.strip()) >= MIN_CHARS_PER_PAGE_THRESHOLD:
                    return ocr_text, True, "ocr_success"
                else:
                    return ocr_text, True, "ocr_low_confidence"
        except Exception as e:
            logger.error(f"OCR failed for {pdf_path.name} p{page_number}: {e}")

        return extracted_text, False, "ocr_tool_missing_needs_review"
