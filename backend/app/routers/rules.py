from fastapi import APIRouter, Depends

from .. import models, schemas
from ..auth import get_current_user
from ..rules import load_rules, rule_metadata

router = APIRouter(tags=["rules"])

_RULES = load_rules("app/rules.yaml")


@router.get("/rules", response_model=list[schemas.RuleOut])
def get_rules(current_user: models.User = Depends(get_current_user)):
    """The Legal Metrology Rule 6 declarations the checker looks for, with their
    plain-English description and statutory citation. Powers the Help page and
    the per-field explanations in the listing-detail view."""
    return rule_metadata(_RULES)
