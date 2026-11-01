"""
Adaptive Recommendation Engine & Prerequisite Graph Analysis for VidyaFlow.
Performs root-cause gap detection and routes learners to next-best activities.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models import (
    Concept,
    ConceptEdge,
    MasteryState,
    MasteryStatus,
    AIRecommendation,
)


def find_unmastered_prerequisites(
    db: Session,
    user_id: int,
    concept_id: int,
) -> List[Dict[str, Any]]:
    """
    Traverses backwards in the prerequisite graph from concept_id to find
    any prerequisite nodes where the student has Needs Support or Developing status.
    This performs root-cause gap detection.
    """
    gaps = []
    edges = db.query(ConceptEdge).filter(ConceptEdge.target_id == concept_id).all()

    for edge in edges:
        prereq = db.query(Concept).filter(Concept.id == edge.source_id).first()
        if not prereq:
            continue

        mastery_record = (
            db.query(MasteryState)
            .filter(
                MasteryState.user_id == user_id,
                MasteryState.concept_id == prereq.id,
            )
            .first()
        )

        p_val = mastery_record.p_mastery if mastery_record else prereq.p_l0
        status = mastery_record.status.value if mastery_record else MasteryStatus.NEEDS_SUPPORT.value

        if p_val < 0.70:
            gaps.append({
                "concept_id": prereq.id,
                "code": prereq.code,
                "title_en": prereq.title_en,
                "title_te": prereq.title_te,
                "title_hi": prereq.title_hi,
                "p_mastery": p_val,
                "status": status,
                "edge_strength": edge.strength,
            })
            # Recursively check parent prerequisites
            parent_gaps = find_unmastered_prerequisites(db, user_id, prereq.id)
            for pg in parent_gaps:
                if not any(g["concept_id"] == pg["concept_id"] for g in gaps):
                    gaps.append(pg)

    return gaps


def determine_next_action(
    db: Session,
    user_id: int,
    current_concept_id: int,
    consecutive_correct: int = 0,
    consecutive_incorrect: int = 0,
) -> Dict[str, Any]:
    """
    Dynamic branching:
    - Fast Learner (high mastery or 2+ consecutive correct) -> Unlocks challenge set / next topic.
    - Struggling Learner (low mastery or 2+ consecutive incorrect) -> Routes to root-cause remedial node.
    - Standard Learner -> Continues guided practice.
    """
    concept = db.query(Concept).filter(Concept.id == current_concept_id).first()
    if not concept:
        return {
            "type": "diagnostic",
            "title": "Start Diagnostic Test",
            "reason": "Establish baseline mastery across Chapter 1 concepts.",
            "action_route": "/student/quiz?mode=diagnostic",
        }

    mastery = (
        db.query(MasteryState)
        .filter(
            MasteryState.user_id == user_id,
            MasteryState.concept_id == current_concept_id,
        )
        .first()
    )
    p_val = mastery.p_mastery if mastery else concept.p_l0

    # 1. Fast Learner Branching
    if p_val >= 0.80 or consecutive_correct >= 2:
        # Check next concept in sequence or challenge questions
        next_concept = (
            db.query(Concept)
            .filter(
                Concept.chapter_id == concept.chapter_id,
                Concept.order_index > concept.order_index,
            )
            .order_by(Concept.order_index.asc())
            .first()
        )

        if next_concept:
            return {
                "branch": "fast_track",
                "type": "advance",
                "title": f"Advance to {next_concept.title_en}",
                "reason": f"Outstanding mastery ({int(p_val * 100)}%) on {concept.title_en}! Ready for the next leap.",
                "target_concept_id": next_concept.id,
                "action_route": f"/student/quiz?concept_id={next_concept.id}&mode=adaptive",
                "is_challenge": True,
            }
        else:
            return {
                "branch": "challenge",
                "type": "challenge_set",
                "title": "Solve Chapter Mastery Challenge",
                "reason": "You have mastered all standard concepts. Test your skills on Olympiad-grade challenges!",
                "target_concept_id": concept.id,
                "action_route": f"/student/quiz?chapter_id={concept.chapter_id}&mode=challenge",
                "is_challenge": True,
            }

    # 2. Struggling Learner Branching with Root-Cause Gap Analysis
    if p_val < 0.45 or consecutive_incorrect >= 2:
        gaps = find_unmastered_prerequisites(db, user_id, current_concept_id)
        if gaps:
            root_gap = gaps[0]  # First prerequisite gap detected
            return {
                "branch": "remedial_gap",
                "type": "remediation",
                "title": f"Review Prerequisite: {root_gap['title_en']}",
                "reason": f"AI detected that a knowledge gap in '{root_gap['title_en']}' is blocking your understanding of '{concept.title_en}'.",
                "target_concept_id": root_gap["concept_id"],
                "action_route": f"/student/notes?concept_id={root_gap['concept_id']}",
                "is_remedial": True,
                "gap_concept": root_gap,
            }
        else:
            return {
                "branch": "remedial_practice",
                "type": "remediation",
                "title": f"Guided Flashcards & Hints for {concept.title_en}",
                "reason": f"Reinforce fundamental rules with step-by-step Socratic hints.",
                "target_concept_id": concept.id,
                "action_route": f"/student/quiz?concept_id={concept.id}&mode=guided",
                "is_remedial": True,
            }

    # 3. Standard Progress
    return {
        "branch": "standard",
        "type": "practice",
        "title": f"Practice {concept.title_en}",
        "reason": f"Current mastery is {int(p_val * 100)}%. Solve 3 more problems to achieve Strong mastery.",
        "target_concept_id": concept.id,
        "action_route": f"/student/quiz?concept_id={concept.id}&mode=adaptive",
    }
