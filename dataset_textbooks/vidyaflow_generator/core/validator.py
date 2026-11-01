"""Phase Six: Automatic Strict Validation for Mind Maps and Quizzes."""
from typing import List, Tuple, Set, Optional, Dict, Any
from vidyaflow_generator.models.mindmap import MindMapData, MindMapNode
from vidyaflow_generator.models.quiz import QuizBank, QuizQuestion
from vidyaflow_generator.models.summary import ChapterSummary
from vidyaflow_generator.models.report import ChapterValidationDetail
from vidyaflow_generator.core.math_verifier import MathVerifier
from vidyaflow_generator.config import (
    EXACT_QUIZ_QUESTION_COUNT,
    QUIZ_DIFFICULTY_DISTRIBUTION,
    MINDMAP_MAX_DEPTH
)


class ContentValidator:
    """Performs rigorous automated validation on generated mind maps, quizzes, and summaries."""

    def __init__(self, math_verifier: Optional[MathVerifier] = None):
        self.math_verifier = math_verifier or MathVerifier()

    def validate_chapter_bundle(
        self,
        chapter_id: str,
        mindmap: MindMapData,
        quiz: QuizBank,
        summary: Optional[ChapterSummary] = None,
        subject: str = "General"
    ) -> Tuple[bool, ChapterValidationDetail]:
        """Validate all components of a generated chapter bundle."""
        mm_valid, mm_errors, node_ids = self.validate_mindmap(mindmap, chapter_id)
        quiz_valid, quiz_errors, num_passed = self.validate_quiz(quiz, chapter_id, node_ids, subject)

        summary_valid = True
        summary_errors: List[str] = []
        if summary:
            summary_valid, summary_errors = self.validate_summary(summary, chapter_id)

        overall_valid = mm_valid and quiz_valid and summary_valid and num_passed
        overall_status = "passed" if overall_valid else "needs_review"

        detail = ChapterValidationDetail(
            chapter_id=chapter_id,
            mindmap_valid=mm_valid,
            mindmap_errors=mm_errors,
            quiz_valid=quiz_valid,
            quiz_errors=quiz_errors,
            summary_valid=summary_valid,
            summary_errors=summary_errors,
            numerical_checks_passed=num_passed,
            overall_status=overall_status
        )
        return overall_valid, detail

    def validate_mindmap(self, mindmap: MindMapData, expected_chapter_id: str) -> Tuple[bool, List[str], Set[str]]:
        """Validate mind map structure, depth, IDs, labels, and relationships."""
        errors: List[str] = []
        node_ids: Set[str] = set()

        if mindmap.chapter_id != expected_chapter_id:
            errors.append(f"Mindmap chapter_id '{mindmap.chapter_id}' != expected '{expected_chapter_id}'")

        if not mindmap.root:
            errors.append("Mindmap is missing root node")
            return False, errors, node_ids

        # Traverse tree and validate depth and node IDs
        max_depth_found = self._traverse_node(mindmap.root, 0, node_ids, errors)

        if max_depth_found > MINDMAP_MAX_DEPTH:
            errors.append(f"Mindmap depth {max_depth_found} exceeds maximum allowed depth {MINDMAP_MAX_DEPTH}")

        # Validate relationships
        for idx, rel in enumerate(mindmap.relationships):
            if rel.source not in node_ids:
                errors.append(f"Relationship [{idx}] source '{rel.source}' does not exist in mindmap tree")
            if rel.target not in node_ids:
                errors.append(f"Relationship [{idx}] target '{rel.target}' does not exist in mindmap tree")

        is_valid = len(errors) == 0
        return is_valid, errors, node_ids

    def _traverse_node(self, node: MindMapNode, current_depth: int, seen_ids: Set[str], errors: List[str]) -> int:
        """Recursive traversal checking labels, uniqueness, and depth."""
        if not node.id or not node.id.strip():
            errors.append(f"Node at depth {current_depth} has empty id")
        elif node.id in seen_ids:
            errors.append(f"Duplicate node ID detected: '{node.id}'")
        else:
            seen_ids.add(node.id)

        if not node.label or len(node.label.strip()) < 2:
            errors.append(f"Node '{node.id}' has missing or too short label: '{node.label}'")

        if not node.description or len(node.description.strip()) < 3:
            errors.append(f"Node '{node.id}' has missing or too short description")

        max_d = current_depth
        for child in node.children:
            child_d = self._traverse_node(child, current_depth + 1, seen_ids, errors)
            max_d = max(max_d, child_d)

        return max_d

    def validate_quiz(
        self,
        quiz: QuizBank,
        expected_chapter_id: str,
        mindmap_concept_ids: Set[str],
        subject: str = "General"
    ) -> Tuple[bool, List[str], bool]:
        """Validate question bank: exactly 20 questions, 7/8/5 difficulty, 4 options, ordering, concepts."""
        errors: List[str] = []
        num_checks_passed = True

        if quiz.chapter_id != expected_chapter_id:
            errors.append(f"Quiz chapter_id '{quiz.chapter_id}' != expected '{expected_chapter_id}'")

        # 1. Total Question Count check (MUST BE EXACTLY 20)
        q_count = len(quiz.questions)
        if q_count != EXACT_QUIZ_QUESTION_COUNT:
            errors.append(f"Question count is {q_count}, must be exactly {EXACT_QUIZ_QUESTION_COUNT}")

        # 2. Difficulty distribution check (7 easy, 8 medium, 5 hard)
        diff_counts = {"easy": 0, "medium": 0, "hard": 0}
        difficulties_in_order = []

        seen_q_texts = set()
        seen_q_ids = set()

        for idx, q in enumerate(quiz.questions):
            # Check question ID uniqueness
            if q.question_id in seen_q_ids:
                errors.append(f"Duplicate question_id '{q.question_id}' at index {idx}")
            seen_q_ids.add(q.question_id)

            # Check question text uniqueness
            clean_text = q.question.strip().lower()
            if clean_text in seen_q_texts:
                errors.append(f"Duplicate question prompt at index {idx}: '{q.question[:40]}...'")
            seen_q_texts.add(clean_text)

            # Check difficulty
            d = q.difficulty.lower()
            if d in diff_counts:
                diff_counts[d] += 1
                difficulties_in_order.append(d)
            else:
                errors.append(f"Question {q.question_id} has invalid difficulty '{q.difficulty}'")

            # Check options (MUST BE EXACTLY 4 with IDs A, B, C, D)
            if len(q.options) != 4:
                errors.append(f"Question {q.question_id} has {len(q.options)} options; must be exactly 4")
            opt_ids = [opt.id for opt in q.options]
            if opt_ids != ["A", "B", "C", "D"]:
                errors.append(f"Question {q.question_id} option IDs are {opt_ids}; must be ['A', 'B', 'C', 'D']")

            # Check correct_answer
            if q.correct_answer not in ["A", "B", "C", "D"]:
                errors.append(f"Question {q.question_id} correct_answer '{q.correct_answer}' not in A, B, C, D")

            # Check explanation
            if not q.explanation or len(q.explanation.strip()) < 5:
                errors.append(f"Question {q.question_id} is missing an informative explanation")

            # Check concept association
            if mindmap_concept_ids and q.concept_id not in mindmap_concept_ids:
                errors.append(f"Question {q.question_id} concept_id '{q.concept_id}' not found in mindmap nodes")

            # Math / Physics numerical calculation check
            math_ok, math_err = self.math_verifier.verify_question(q, subject)
            if not math_ok:
                num_checks_passed = False
                errors.append(f"Math calculation verification failed for {q.question_id}: {math_err}")

        # Check difficulty count compliance
        for expected_diff, expected_num in QUIZ_DIFFICULTY_DISTRIBUTION.items():
            actual_num = diff_counts.get(expected_diff, 0)
            if actual_num != expected_num:
                errors.append(f"Difficulty '{expected_diff}' has {actual_num} questions; required is {expected_num}")

        # Check easy -> medium -> hard ordering
        expected_order = (
            ["easy"] * QUIZ_DIFFICULTY_DISTRIBUTION["easy"] +
            ["medium"] * QUIZ_DIFFICULTY_DISTRIBUTION["medium"] +
            ["hard"] * QUIZ_DIFFICULTY_DISTRIBUTION["hard"]
        )
        if len(difficulties_in_order) == EXACT_QUIZ_QUESTION_COUNT:
            if difficulties_in_order != expected_order:
                errors.append(
                    f"Questions difficulty ordering incorrect: found {difficulties_in_order[:7]}...; "
                    f"must be easy (7) -> medium (8) -> hard (5)"
                )

        is_valid = len(errors) == 0
        return is_valid, errors, num_checks_passed

    def validate_summary(self, summary: ChapterSummary, expected_chapter_id: str) -> Tuple[bool, List[str]]:
        """Validate educational chapter summary."""
        errors: List[str] = []
        if summary.chapter_id != expected_chapter_id:
            errors.append(f"Summary chapter_id '{summary.chapter_id}' != expected '{expected_chapter_id}'")

        if not summary.chapter_overview or len(summary.chapter_overview.strip()) < 30:
            errors.append("Summary chapter_overview is too short or missing")

        if len(summary.learning_objectives) < 2:
            errors.append("Summary should have at least 2 learning objectives")

        if len(summary.main_concepts) < 2:
            errors.append("Summary should have at least 2 main concepts")

        return len(errors) == 0, errors
