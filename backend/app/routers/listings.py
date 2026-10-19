from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(tags=["listings"])


@router.get("/listings", response_model=list[schemas.ListingOut])
def get_listings(
    flagged_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    output = []
    for listing in db.query(models.Listing).all():
        results = (
            db.query(models.ComplianceResult)
            .filter_by(listing_id=listing.id)
            .all()
        )
        missing = [r.field_name for r in results if not r.is_present]
        if flagged_only and not missing:
            continue
        output.append(
            {
                "id": listing.id,
                "product_name": listing.product_name,
                "platform": listing.platform,
                "missing_fields": missing,
            }
        )
    return output
