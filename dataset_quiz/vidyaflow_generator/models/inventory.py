"""Inventory models for textbooks and extracted chapters."""
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class TextbookRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    textbook_id: str = Field(..., description="Stable unique ID for the textbook")
    filename: str = Field(..., description="Name of the PDF file")
    class_level: int = Field(..., alias="class", ge=1, le=12, description="Target class/grade")
    board: str = Field(..., description="Educational board (e.g., Telangana State Board (SCERT))")
    subject: str = Field(..., description="Subject name (Mathematics, Social Studies, etc.)")
    language: str = Field(default="English", description="Medium / language")
    edition: Optional[str] = Field(default="2026-27", description="Academic edition or year")
    page_count: int = Field(..., ge=1, description="Total number of pages in the PDF")
    extraction_quality: str = Field(default="high", description="Extraction quality: high, medium, low, unreadable")
    is_scanned: bool = Field(default=False, description="Whether PDF contains scanned images")
    ocr_required: bool = Field(default=False, description="Whether OCR is needed to extract text")
    is_duplicate: bool = Field(default=False, description="True if identical to another textbook")
    canonical_textbook_id: Optional[str] = Field(default=None, description="Canonical textbook ID if duplicate")
    file_sha256: Optional[str] = Field(default=None, description="SHA256 checksum of the PDF file")
    extraction_status: str = Field(default="completed", description="Status: completed, needs_review, failed")


class TextbookInventory(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    textbooks: List[TextbookRecord] = Field(default_factory=list)
    total_textbooks: int = Field(default=0)
    total_pages: int = Field(default=0)
    generated_at: str = Field(default="")


class ChapterRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    chapter_id: str = Field(..., description="Stable unique ID for the chapter")
    textbook_id: str = Field(..., description="Reference to textbook_id")
    board: str = Field(..., description="Educational board")
    class_level: int = Field(..., alias="class", ge=1, le=12, description="Grade level")
    subject: str = Field(..., description="Subject")
    chapter_number: int = Field(..., ge=1, description="Original chapter number")
    chapter_title: str = Field(..., description="Extracted chapter title")
    source_pdf: str = Field(..., description="Source PDF filename")
    start_page: int = Field(..., ge=1, description="Logical printed start page")
    end_page: int = Field(..., ge=1, description="Logical printed end page")
    pdf_start_page: Optional[int] = Field(default=None, description="1-based physical PDF start page")
    pdf_end_page: Optional[int] = Field(default=None, description="1-based physical PDF end page")
    extracted_text: str = Field(default="", description="Full extracted chapter text")
    char_count: Optional[int] = Field(default=0, description="Length of extracted text")
    extraction_status: str = Field(default="completed", description="completed, needs_review, failed")


class ChapterInventory(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    chapters: List[ChapterRecord] = Field(default_factory=list)
    total_chapters: int = Field(default=0)
    generated_at: str = Field(default="")
