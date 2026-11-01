"""Tests for Math and Physics calculation verification."""
import pytest
from vidyaflow_generator.core.math_verifier import MathVerifier
from vidyaflow_generator.models.quiz import QuizQuestion, QuestionOption


def test_math_verifier_correct_calculation():
    verifier = MathVerifier()
    q = QuizQuestion(
        question_id="math_q_1",
        chapter_id="ch_1",
        concept_id="c_1",
        question="What is the value of: (-18) + 25 + (-7)?",
        question_type="mcq",
        options=[
            QuestionOption(id="A", text="0"),
            QuestionOption(id="B", text="14"),
            QuestionOption(id="C", text="-14"),
            QuestionOption(id="D", text="50"),
        ],
        correct_answer="A",
        explanation="(-18) + (-7) = -25. Then -25 + 25 = 0.",
        difficulty="easy",
        source_page=5
    )
    is_valid, err = verifier.verify_question(q, "Mathematics")
    assert is_valid is True
    assert err is None


def test_math_verifier_detects_wrong_answer():
    verifier = MathVerifier()
    q = QuizQuestion(
        question_id="math_q_2",
        chapter_id="ch_1",
        concept_id="c_1",
        question="Compute the value of: 15 + 25?",
        question_type="mcq",
        options=[
            QuestionOption(id="A", text="10"),
            QuestionOption(id="B", text="35"),
            QuestionOption(id="C", text="40"),
            QuestionOption(id="D", text="50"),
        ],
        correct_answer="A",  # Declaring 10 as correct when 15 + 25 = 40!
        explanation="15 + 25 = 40",
        difficulty="easy",
        source_page=5
    )
    is_valid, err = verifier.verify_question(q, "Mathematics")
    assert is_valid is False
    assert "Mathematical mismatch" in err
