"""Structured schemas for Generation and Validation reports."""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class TokenUsage(BaseModel):
    prompt_tokens: int = Field(default=0)
    completion_tokens: int = Field(default=0)
    total_tokens: int = Field(default=0)
    estimated_cost_usd: float = Field(default=0.0)


class ChapterGenerationResult(BaseModel):
    chapter_id: str
    chapter_title: str
    class_level: int
    subject: str
    board: str
    summary_generated: bool = False
    mindmap_generated: bool = False
    quiz_generated: bool = False
    validated_questions_count: int = 0
    status: str = "completed"  # completed, needs_review, failed
    notes: List[str] = Field(default_factory=list)


class GenerationReport(BaseModel):
    total_pdfs_discovered: int = 0
    total_pdfs_extracted: int = 0
    total_scanned_pdfs: int = 0
    total_chapters_detected: int = 0
    total_chapters_mapped: int = 0
    total_summaries_generated: int = 0
    total_mindmaps_generated: int = 0
    total_quizzes_generated: int = 0
    total_questions_validated: int = 0
    total_failed_chapters: int = 0
    total_needs_review_chapters: int = 0
    errors: List[Dict[str, Any]] = Field(default_factory=list)
    token_usage: TokenUsage = Field(default_factory=TokenUsage)
    hierarchy: Dict[str, Any] = Field(default_factory=dict, description="Grouped by Board -> Class -> Subject -> Chapter")
    generated_at: str = ""


class ChapterValidationDetail(BaseModel):
    chapter_id: str
    mindmap_valid: bool
    mindmap_errors: List[str] = Field(default_factory=list)
    quiz_valid: bool
    quiz_errors: List[str] = Field(default_factory=list)
    summary_valid: bool
    summary_errors: List[str] = Field(default_factory=list)
    numerical_checks_passed: bool = True
    overall_status: str = "passed"  # passed, failed, needs_review


class ValidationReport(BaseModel):
    total_chapters_checked: int = 0
    total_passed: int = 0
    total_failed: int = 0
    total_needs_review: int = 0
    details: List[ChapterValidationDetail] = Field(default_factory=list)
    generated_at: str = ""
