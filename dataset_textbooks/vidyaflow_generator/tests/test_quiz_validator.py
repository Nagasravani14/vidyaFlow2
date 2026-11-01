"""Tests for Quiz Question Bank validation."""
import pytest
from vidyaflow_generator.core.validator import ContentValidator
from vidyaflow_generator.models.quiz import QuizQuestion, QuestionOption


def test_valid_quiz_passes(sample_quiz, sample_mindmap):
    validator = ContentValidator()
    node_ids = {"concept_1", "concept_2", "root", "topic_1", "subtopic_1", "subtopic_2"}
    is_valid, errors, num_ok = validator.validate_quiz(sample_quiz, sample_quiz.chapter_id, node_ids, "Mathematics")
    assert is_valid is True
    assert num_ok is True
    assert len(errors) == 0


def test_quiz_wrong_question_count_fails(sample_quiz, sample_mindmap):
    validator = ContentValidator()
    node_ids = {"concept_1", "concept_2", "root", "topic_1", "subtopic_1", "subtopic_2"}
    # Remove one question (19 questions)
    sample_quiz.questions.pop()
    is_valid, errors, _ = validator.validate_quiz(sample_quiz, sample_quiz.chapter_id, node_ids, "Mathematics")
    assert is_valid is False
    assert any("Question count is 19, must be exactly 20" in e for e in errors)


def test_quiz_wrong_difficulty_distribution_fails(sample_quiz, sample_mindmap):
    validator = ContentValidator()
    node_ids = {"concept_1", "concept_2", "root", "topic_1", "subtopic_1", "subtopic_2"}
    # Change first question to hard (so 6 easy, 8 medium, 6 hard)
    sample_quiz.questions[0].difficulty = "hard"
    is_valid, errors, _ = validator.validate_quiz(sample_quiz, sample_quiz.chapter_id, node_ids, "Mathematics")
    assert is_valid is False
    assert any("Difficulty 'easy' has 6 questions; required is 7" in e for e in errors)


def test_quiz_disordered_difficulty_fails(sample_quiz, sample_mindmap):
    validator = ContentValidator()
    node_ids = {"concept_1", "concept_2", "root", "topic_1", "subtopic_1", "subtopic_2"}
    # Swap question 0 (easy) and question 7 (medium)
    sample_quiz.questions[0], sample_quiz.questions[7] = sample_quiz.questions[7], sample_quiz.questions[0]
    is_valid, errors, _ = validator.validate_quiz(sample_quiz, sample_quiz.chapter_id, node_ids, "Mathematics")
    assert is_valid is False
    assert any("ordering incorrect" in e for e in errors)


def test_quiz_invalid_concept_reference_fails(sample_quiz, sample_mindmap):
    validator = ContentValidator()
    node_ids = {"concept_1", "concept_2"}
    sample_quiz.questions[0].concept_id = "completely_invalid_concept_id"
    is_valid, errors, _ = validator.validate_quiz(sample_quiz, sample_quiz.chapter_id, node_ids, "Mathematics")
    assert is_valid is False
    assert any("not found in mindmap nodes" in e for e in errors)


def test_quiz_duplicate_options_fails(sample_quiz, sample_mindmap):
    validator = ContentValidator()
    node_ids = {"concept_1", "concept_2"}
    sample_quiz.questions[0].options[1].text = sample_quiz.questions[0].options[0].text
    is_valid, errors, num_ok = validator.validate_quiz(sample_quiz, sample_quiz.chapter_id, node_ids, "Mathematics")
    assert is_valid is False
    assert num_ok is False
    assert any("duplicate options" in e.lower() for e in errors)
