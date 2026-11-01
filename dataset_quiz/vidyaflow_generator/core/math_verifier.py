"""Phase Five: Deterministic Math and Physics Numerical Verifier."""
import re
import logging
from typing import Optional, Tuple, Dict, Any, List
import sympy

from vidyaflow_generator.models.quiz import QuizQuestion, QuestionOption

logger = logging.getLogger(__name__)


class MathVerifier:
    """Verifies mathematical and scientific calculations deterministically using Python / SymPy."""

    def verify_question(self, question: QuizQuestion, subject: str) -> Tuple[bool, Optional[str]]:
        """
        Validates if question options are distinct and if numerical calculations in question/explanation
        match the declared correct option.
        Returns (is_valid, error_message).
        """
        # 1. Option uniqueness check
        option_texts = [opt.text.strip().lower() for opt in question.options]
        if len(set(option_texts)) != 4:
            return False, f"Question '{question.question_id}' has duplicate options: {option_texts}"

        # 2. Correct answer existence check
        correct_opt = next((opt for opt in question.options if opt.id == question.correct_answer), None)
        if not correct_opt:
            return False, f"Declared correct_answer '{question.correct_answer}' not found in options."

        # 3. For Mathematics and Physics: attempt numerical expression verification
        subj_lower = subject.lower()
        if "math" in subj_lower or "physic" in subj_lower:
            calc_valid, calc_err = self._verify_numerical_calculation(question, correct_opt)
            if not calc_valid:
                logger.warning(f"Math calculation warning on {question.question_id}: {calc_err}")
                return False, calc_err

        return True, None

    def _verify_numerical_calculation(
        self,
        question: QuizQuestion,
        correct_opt: QuestionOption
    ) -> Tuple[bool, Optional[str]]:
        """Attempt to extract and verify arithmetic/algebraic evaluation."""
        opt_text = correct_opt.text.strip()
        opt_num_match = re.search(r'[-+]?\d*\.?\d+', opt_text)
        if not opt_num_match:
            return True, None

        opt_val = float(opt_num_match.group(0))

        # First, check the question prompt for arithmetic expressions
        q_patterns = [
            r'value of\s*:?\s*([0-9\(\)\+\-\*\/\^\.\s]+)',
            r'evaluate\s*:?\s*([0-9\(\)\+\-\*\/\^\.\s]+)',
            r'compute\s*:?\s*([0-9\(\)\+\-\*\/\^\.\s]+)',
            r'([0-9\(\)\+\-\*\/\^\.\s]+)\s*=\s*\?'
        ]

        for pat in q_patterns:
            m = re.search(pat, question.question, re.I)
            if m:
                expr_str = m.group(1).strip().rstrip('?')
                if re.match(r'^[0-9\(\)\+\-\*\/\^\.\s]+$', expr_str) and any(op in expr_str for op in ['+', '-', '*', '/']):
                    try:
                        evaluated_val = float(sympy.sympify(expr_str.replace('^', '**')))
                        if abs(evaluated_val - opt_val) > 0.01:
                            return False, (
                                f"Mathematical mismatch in {question.question_id}: "
                                f"expression '{expr_str}' evaluates to {evaluated_val}, "
                                f"but correct option {correct_opt.id} contains {opt_val}."
                            )
                        return True, None
                    except Exception:
                        pass

        # Second, search explanation for full equations matching the option
        eq_matches = re.findall(r'([0-9\(\)\+\-\*\/\^\.\s]+)\s*=\s*([-+]?\d*\.?\d+)', question.explanation)
        for expr_str, res_str in eq_matches:
            expr_clean = expr_str.strip()
            if re.match(r'^[0-9\(\)\+\-\*\/\^\.\s]+$', expr_clean) and any(op in expr_clean for op in ['+', '-', '*', '/']):
                try:
                    eval_res = float(sympy.sympify(expr_clean.replace('^', '**')))
                    declared_res = float(res_str)
                    if abs(eval_res - declared_res) > 0.01:
                        return False, f"Invalid equation in explanation: {expr_clean} != {res_str}"
                    # If this equation's result matches the option value, verification succeeds
                    if abs(eval_res - opt_val) < 0.01:
                        return True, None
                except Exception:
                    pass

        return True, None
