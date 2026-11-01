"""Pytest fixtures for VidyaFlow tests."""
import pytest
from vidyaflow_generator.models.inventory import TextbookRecord, ChapterRecord
from vidyaflow_generator.models.mindmap import MindMapData, MindMapNode, MindMapRelationship, MindMapSource
from vidyaflow_generator.models.quiz import QuizBank, QuizQuestion, QuestionOption
from vidyaflow_generator.models.summary import ChapterSummary, ConceptOverview, DefinitionItem, FormulaItem


@pytest.fixture
def sample_textbook() -> TextbookRecord:
    return TextbookRecord(
        textbook_id="class_8_telangana_mathematics",
        filename="8 Maths EM.pdf",
        class_level=8,
        board="Telangana State Board (SCERT)",
        subject="Mathematics",
        language="English",
        edition="2026-27",
        page_count=378,
        extraction_quality="high",
        is_scanned=False,
        ocr_required=False,
        is_duplicate=False,
        file_sha256="abc123def456",
        extraction_status="completed"
    )


@pytest.fixture
def sample_chapter() -> ChapterRecord:
    return ChapterRecord(
        chapter_id="class_8_math_ch01_rational_numbers",
        textbook_id="class_8_telangana_mathematics",
        board="Telangana State Board (SCERT)",
        class_level=8,
        subject="Mathematics",
        chapter_number=1,
        chapter_title="Rational Numbers",
        source_pdf="8 Maths EM.pdf",
        start_page=1,
        end_page=36,
        pdf_start_page=11,
        pdf_end_page=46,
        extracted_text="Chapter 1 Rational Numbers. Integers, whole numbers, and rationals.",
        char_count=65,
        extraction_status="completed"
    )


@pytest.fixture
def sample_mindmap() -> MindMapData:
    concept_1 = MindMapNode(id="concept_1", label="Properties of Addition", description="Closure and commutative laws", children=[])
    concept_2 = MindMapNode(id="concept_2", label="Properties of Multiplication", description="Associative and distributive laws", children=[])

    sub_1 = MindMapNode(id="subtopic_1", label="Addition Laws", description="Rules of addition", children=[concept_1])
    sub_2 = MindMapNode(id="subtopic_2", label="Multiplication Laws", description="Rules of multiplication", children=[concept_2])

    topic_1 = MindMapNode(id="topic_1", label="Rational Operations", description="Arithmetic properties", children=[sub_1, sub_2])

    root = MindMapNode(id="root", label="Rational Numbers", description="Study of Q numbers", children=[topic_1])

    rel = MindMapRelationship(source="concept_1", target="concept_2", relationship_type="foundation_for")
    src = MindMapSource(textbook_id="class_8_telangana_mathematics", chapter_id="class_8_math_ch01_rational_numbers", page_range=[1, 36])

    return MindMapData(
        chapter_id="class_8_math_ch01_rational_numbers",
        title="Rational Numbers",
        root=root,
        relationships=[rel],
        source=src
    )


@pytest.fixture
def sample_quiz(sample_mindmap) -> QuizBank:
    questions = []
    # 7 Easy, 8 Medium, 5 Hard
    diffs = ["easy"] * 7 + ["medium"] * 8 + ["hard"] * 5

    for i, diff in enumerate(diffs, start=1):
        q_id = f"class_8_math_ch01_q{i:02d}"
        c_id = "concept_1" if i % 2 == 1 else "concept_2"
        questions.append(QuizQuestion(
            question_id=q_id,
            chapter_id="class_8_math_ch01_rational_numbers",
            concept_id=c_id,
            question=f"Test question prompt number {i} for {diff} level?",
            question_type="mcq",
            options=[
                QuestionOption(id="A", text=f"Correct answer {i}"),
                QuestionOption(id="B", text=f"Distractor 1 for {i}"),
                QuestionOption(id="C", text=f"Distractor 2 for {i}"),
                QuestionOption(id="D", text=f"Distractor 3 for {i}"),
            ],
            correct_answer="A",
            explanation=f"Explanation for question {i}.",
            difficulty=diff,
            source_page=i
        ))

    return QuizBank(
        chapter_id="class_8_math_ch01_rational_numbers",
        questions=questions
    )


@pytest.fixture
def sample_summary() -> ChapterSummary:
    return ChapterSummary(
        chapter_id="class_8_math_ch01_rational_numbers",
        title="Rational Numbers",
        class_level=8,
        subject="Mathematics",
        chapter_overview="Rational numbers include all numbers expressible in p/q form where q is not zero.",
        learning_objectives=[
            "Identify rational numbers on the number line.",
            "Apply commutative and associative properties."
        ],
        main_concepts=[
            ConceptOverview(concept_id="concept_1", name="Closure Property", description="Sum of two rationals is rational."),
            ConceptOverview(concept_id="concept_2", name="Distributive Law", description="a*(b+c) = a*b + a*c")
        ],
        important_definitions=[
            DefinitionItem(term="Rational Number", definition="A number of the form p/q with integers p and q!=0.", context="Core definition")
        ],
        important_formulas=[
            FormulaItem(name="Distributive Law", formula="a(b+c) = ab + ac", description="Multiplication distributes over addition")
        ],
        key_facts=["Zero is a rational number.", "Reciprocal of zero does not exist."],
        short_revision_notes=["Check common denominators before adding.", "Multiply numerators and denominators directly."]
    )
