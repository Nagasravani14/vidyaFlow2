"""Structured schema for interactive mind maps (mindmap.json)."""
from typing import List, Optional
from pydantic import BaseModel, Field


class MindMapNode(BaseModel):
    id: str = Field(..., description="Stable node identifier (e.g., 'root', 'topic_1', 'concept_1')")
    label: str = Field(..., description="Meaningful topic or concept label")
    description: str = Field(..., description="Concise, age-appropriate concept explanation")
    children: List["MindMapNode"] = Field(default_factory=list, description="Subtopics or child concepts")


# Enable self-referencing model for children
MindMapNode.model_rebuild()


class MindMapRelationship(BaseModel):
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    relationship_type: Optional[str] = Field(default="relates_to", description="Type of relationship (e.g. prerequisite, application, subset)")


class MindMapSource(BaseModel):
    textbook_id: str = Field(..., description="Source textbook ID")
    chapter_id: str = Field(..., description="Source chapter ID")
    page_range: List[int] = Field(default_factory=list, description="[start_page, end_page]")


class MindMapData(BaseModel):
    chapter_id: str = Field(..., description="Stable chapter identifier")
    title: str = Field(..., description="Chapter title")
    root: MindMapNode = Field(..., description="Central chapter root node")
    relationships: List[MindMapRelationship] = Field(default_factory=list, description="Inter-concept relationships")
    source: MindMapSource = Field(..., description="Source textbook provenance")
