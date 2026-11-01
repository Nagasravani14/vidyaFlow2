from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Chapter, Concept, ConceptEdge, MasteryState, MasteryStatus, User
from ..schemas import MindMapResponse, ConceptNode, ConceptEdgeOut
from ..adaptive_engine.recommendations import find_unmastered_prerequisites
from ..adaptive_engine.bkt import calculate_aggregate_mastery

router = APIRouter(prefix="/api/mindmap", tags=["mindmap"])


@router.get("/{chapter_id}", response_model=MindMapResponse)
def get_chapter_mindmap(
    chapter_id: int,
    user_id: int = 1,
    db: Session = Depends(get_db),
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        chapter = db.query(Chapter).first()
        if not chapter:
            raise HTTPException(status_code=404, detail="Chapter not found")

    concepts = (
        db.query(Concept)
        .filter(Concept.chapter_id == chapter.id)
        .order_by(Concept.order_index.asc())
        .all()
    )

    concept_ids = [c.id for c in concepts]
    edges = (
        db.query(ConceptEdge)
        .filter(
            ConceptEdge.source_id.in_(concept_ids),
            ConceptEdge.target_id.in_(concept_ids),
        )
        .all()
    )

    # Map ID to Code
    id_to_concept = {c.id: c for c in concepts}

    nodes: list[ConceptNode] = []
    mastery_values: list[float] = []
    root_cause_gaps = []

    for c in concepts:
        m_state = (
            db.query(MasteryState)
            .filter(
                MasteryState.user_id == user_id,
                MasteryState.concept_id == c.id,
            )
            .first()
        )
        p_val = m_state.p_mastery if m_state else c.p_l0
        status_val = m_state.status.value if m_state else MasteryStatus.NEEDS_SUPPORT.value
        mastery_values.append(p_val)

        is_gap = p_val < 0.45
        if is_gap:
            # Check prerequisites to find if this is a root-cause gap
            prereq_gaps = find_unmastered_prerequisites(db, user_id, c.id)
            if prereq_gaps:
                for pg in prereq_gaps:
                    if not any(rg["concept_id"] == pg["concept_id"] for rg in root_cause_gaps):
                        root_cause_gaps.append(pg)
            else:
                root_cause_gaps.append({
                    "concept_id": c.id,
                    "code": c.code,
                    "title_en": c.title_en,
                    "title_te": c.title_te,
                    "title_hi": c.title_hi,
                    "p_mastery": p_val,
                    "status": status_val,
                })

        nodes.append(
            ConceptNode(
                id=c.id,
                code=c.code,
                title_en=c.title_en,
                title_te=c.title_te,
                title_hi=c.title_hi,
                description_en=c.description_en,
                description_te=c.description_te,
                description_hi=c.description_hi,
                order_index=c.order_index,
                difficulty=c.difficulty_level,
                p_mastery=round(p_val, 2),
                status=status_val,
                is_gap=is_gap,
            )
        )

    edges_out: list[ConceptEdgeOut] = []
    for e in edges:
        src = id_to_concept.get(e.source_id)
        tgt = id_to_concept.get(e.target_id)
        if src and tgt:
            edges_out.append(
                ConceptEdgeOut(
                    id=e.id,
                    source_id=e.source_id,
                    target_id=e.target_id,
                    source_code=src.code,
                    target_code=tgt.code,
                    edge_type=e.edge_type,
                    strength=e.strength,
                )
            )

    return MindMapResponse(
        chapter_id=chapter.id,
        chapter_title=chapter.title,
        nodes=nodes,
        edges=edges_out,
        root_cause_gaps=root_cause_gaps,
        overall_mastery=calculate_aggregate_mastery(mastery_values),
    )
