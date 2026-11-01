"""Structured schema for chapter quiz banks (quiz.json)."""
from typing import List, Literal
from pydantic import BaseModel, Field


class QuestionOption(BaseModel):
    id: Literal["A", "B", "C", "D"] = Field(..., description="Option letter: A, B, C, or D")
    text: str = Field(..., description="Option text")


class QuizQuestion(BaseModel):
    question_id: str = Field(..., description="Stable unique question ID (e.g., class_8_math_ch01_q01)")
    chapter_id: str = Field(..., description="Stable chapter identifier")
    concept_id: str = Field(..., description="Associated mind map node ID")
    question: str = Field(..., description="Question prompt grounded in the textbook")
    question_type: str = Field(default="mcq", description="Question format (must be mcq)")
    options: List[QuestionOption] = Field(..., min_length=4, max_length=4, description="Exactly four options A, B, C, D")
    correct_answer: Literal["A", "B", "C", "D"] = Field(..., description="Single correct option letter")
    explanation: str = Field(..., description="Detailed pedagogical explanation of why this answer is correct")
    difficulty: Literal["easy", "medium", "hard"] = Field(..., description="Question difficulty")
    source_page: int = Field(..., ge=1, description="Textbook page number where concept/fact originates")


class QuizBank(BaseModel):
    chapter_id: str = Field(..., description="Stable chapter identifier")
    questions: List[QuizQuestion] = Field(..., description="List of questions (exactly 20)")
