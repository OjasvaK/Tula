from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(tags=["stats"])


@router.get("/stats/trends")
def get_violation_trends(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    counts: dict[str, int] = {}
    for r in db.query(models.ComplianceResult).filter_by(is_present=False).all():
        counts[r.field_name] = counts.get(r.field_name, 0) + 1
    return counts
