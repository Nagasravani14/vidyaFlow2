"""
Bayesian Knowledge Tracing (BKT) Engine for VidyaFlow.
Computes deterministic mastery probabilities and categorizes concept proficiency.
"""

from typing import Tuple, Dict, Any
from ..models import MasteryStatus


def update_bkt_mastery(
    p_current: float,
    is_correct: bool,
    p_transit: float = 0.15,
    p_guess: float = 0.20,
    p_slip: float = 0.10,
) -> Tuple[float, MasteryStatus, Dict[str, Any]]:
    """
    Computes updated knowledge mastery probability P(L_t) given an observation.
    
    Args:
        p_current: Previous mastery probability P(L_{t-1})
        is_correct: Whether the student answered correctly
        p_transit: Transition/learning probability P(T)
        p_guess: Guess probability P(G)
        p_slip: Slip probability P(S)
        
    Returns:
        (updated_p_mastery, mastery_status, diagnostic_meta)
    """
    # Guard bounds
    p_current = max(0.01, min(0.99, p_current))
    p_transit = max(0.01, min(0.50, p_transit))
    p_guess = max(0.05, min(0.40, p_guess))
    p_slip = max(0.01, min(0.30, p_slip))

    if is_correct:
        # P(L_t-1 | Correct) = (P(L) * (1 - S)) / (P(L)*(1 - S) + (1 - P(L))*G)
        numerator = p_current * (1.0 - p_slip)
        denominator = numerator + ((1.0 - p_current) * p_guess)
        p_posterior = numerator / denominator if denominator > 0 else p_current
    else:
        # P(L_t-1 | Incorrect) = (P(L) * S) / (P(L)*S + (1 - P(L))*(1 - G))
        numerator = p_current * p_slip
        denominator = numerator + ((1.0 - p_current) * (1.0 - p_guess))
        p_posterior = numerator / denominator if denominator > 0 else p_current

    # Update with transition probability (student learned during practice)
    p_new = p_posterior + ((1.0 - p_posterior) * p_transit)
    p_new = round(max(0.05, min(0.98, p_new)), 4)

    # Classify status
    if p_new >= 0.75:
        status = MasteryStatus.STRONG
    elif p_new >= 0.45:
        status = MasteryStatus.DEVELOPING
    else:
        status = MasteryStatus.NEEDS_SUPPORT

    metadata = {
        "prior_mastery": round(p_current, 4),
        "posterior_after_obs": round(p_posterior, 4),
        "updated_mastery": p_new,
        "delta": round(p_new - p_current, 4),
        "status": status.value,
        "observation": "correct" if is_correct else "incorrect",
        "parameters": {
            "p_transit": p_transit,
            "p_guess": p_guess,
            "p_slip": p_slip,
        },
    }

    return p_new, status, metadata


def calculate_aggregate_mastery(masteries: list[float]) -> float:
    """Returns rounded average mastery score percentage (0 to 100)."""
    if not masteries:
        return 0.0
    return round((sum(masteries) / len(masteries)) * 100, 1)
