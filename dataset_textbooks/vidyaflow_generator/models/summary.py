"""Structured schema for chapter educational summaries (summary.json)."""
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ConceptOverview(BaseModel):
    concept_id: str = Field(..., description="Stable concept node ID")
    name: str = Field(..., description="Concept name")
    description: str = Field(..., description="Concise educational description")


class DefinitionItem(BaseModel):
    term: str = Field(..., description="Term being defined")
    definition: str = Field(..., description="Textbook-grounded definition")
    context: Optional[str] = Field(default="", description="Contextual usage or example")


class FormulaItem(BaseModel):
    name: str = Field(..., description="Formula name or law")
    formula: str = Field(..., description="Mathematical notation / expression")
    description: str = Field(..., description="Explanation of variables and conditions")


class ChapterSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    chapter_id: str = Field(..., description="Stable unique ID of the chapter")
    title: str = Field(..., description="Chapter title")
    class_level: int = Field(..., alias="class", description="Class / Grade level")
    subject: str = Field(..., description="Subject")
    chapter_overview: str = Field(..., description="Comprehensive overview of the chapter")
    learning_objectives: List[str] = Field(default_factory=list, description="Measurable educational objectives")
    main_concepts: List[ConceptOverview] = Field(default_factory=list, description="Core concepts in chapter")
    important_definitions: List[DefinitionItem] = Field(default_factory=list, description="Key definitions")
    important_formulas: List[FormulaItem] = Field(default_factory=list, description="Key formulas, if applicable")
    key_facts: List[str] = Field(default_factory=list, description="Crucial facts, principles, or historical milestones")
    short_revision_notes: List[str] = Field(default_factory=list, description="High-yield revision bullet points")
