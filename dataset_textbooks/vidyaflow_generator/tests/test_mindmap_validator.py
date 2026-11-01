"""Tests for Mind Map structural validation."""
import pytest
from vidyaflow_generator.core.validator import ContentValidator
from vidyaflow_generator.models.mindmap import MindMapData, MindMapNode, MindMapRelationship, MindMapSource


def test_valid_mindmap_passes(sample_mindmap):
    validator = ContentValidator()
    is_valid, errors, node_ids = validator.validate_mindmap(sample_mindmap, sample_mindmap.chapter_id)
    assert is_valid is True
    assert len(errors) == 0
    assert "concept_1" in node_ids
    assert "concept_2" in node_ids


def test_mindmap_duplicate_node_ids_fails(sample_mindmap):
    validator = ContentValidator()
    # Add child with duplicate id 'concept_1'
    dup_node = MindMapNode(id="concept_1", label="Duplicate Label", description="Some desc", children=[])
    sample_mindmap.root.children[0].children.append(dup_node)

    is_valid, errors, _ = validator.validate_mindmap(sample_mindmap, sample_mindmap.chapter_id)
    assert is_valid is False
    assert any("Duplicate node ID" in e for e in errors)


def test_mindmap_excessive_depth_fails(sample_mindmap):
    validator = ContentValidator()
    # Tree currently has: root (0) -> topic_1 (1) -> subtopic_1 (2) -> concept_1 (3)
    # Add depth 4 node (exceeds max depth 3)
    level_4_node = MindMapNode(id="level_4_node", label="Too Deep", description="Exceeds level 3", children=[])
    sample_mindmap.root.children[0].children[0].children[0].children.append(level_4_node)

    is_valid, errors, _ = validator.validate_mindmap(sample_mindmap, sample_mindmap.chapter_id)
    assert is_valid is False
    assert any("exceeds maximum allowed depth" in e for e in errors)


def test_mindmap_invalid_relationship_fails(sample_mindmap):
    validator = ContentValidator()
    # Relationship to non-existent node
    bad_rel = MindMapRelationship(source="concept_1", target="non_existent_node_999", relationship_type="relates_to")
    sample_mindmap.relationships.append(bad_rel)

    is_valid, errors, _ = validator.validate_mindmap(sample_mindmap, sample_mindmap.chapter_id)
    assert is_valid is False
    assert any("target 'non_existent_node_999' does not exist" in e for e in errors)


def test_mindmap_empty_labels_fails(sample_mindmap):
    validator = ContentValidator()
    sample_mindmap.root.label = " "
    is_valid, errors, _ = validator.validate_mindmap(sample_mindmap, sample_mindmap.chapter_id)
    assert is_valid is False
    assert any("too short label" in e for e in errors)
