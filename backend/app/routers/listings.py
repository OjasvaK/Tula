import csv
import io
import os

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db
from ..rules import load_rules, rule_metadata

router = APIRouter(tags=["listings"])

_RULES = load_rules("app/rules.yaml")
_RULE_ORDER = list(_RULES.keys())
_RULE_DESCRIPTIONS = {m["field"]: m["description"] for m in rule_metadata(_RULES)}
_RULE_REFERENCES = {m["field"]: m["legal_reference"] for m in rule_metadata(_RULES)}


def _visible_listings(db: Session):
    return (
        db.query(models.Listing)
        .filter(models.Listing.deleted_at.is_(None))
        .options(selectinload(models.Listing.results))
    )


def _summarise(listing: models.Listing) -> dict:
    results = listing.results
    missing = [r.field_name for r in results if not r.is_present]
    # Keep the missing fields in rules.yaml order for a stable UI.
    missing.sort(key=lambda f: _RULE_ORDER.index(f) if f in _RULE_ORDER else 99)
    return {
        "id": listing.id,
        "product_name": listing.product_name,
        "platform": listing.platform,
        "missing_fields": missing,
        "missing_count": len(missing),
        "total_fields": len(results),
        "compliant": len(missing) == 0 and len(results) > 0,
        "scraped_at": listing.scraped_at,
    }


@router.get("/listings", response_model=list[schemas.ListingOut])
def get_listings(
    flagged_only: bool = False,
    platform: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = _visible_listings(db)
    if platform:
        query = query.filter(models.Listing.platform == platform)
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            func.lower(models.Listing.product_name).like(like)
        )

    output = []
    for listing in query.order_by(models.Listing.id.desc()).all():
        summary = _summarise(listing)
        if flagged_only and summary["compliant"]:
            continue
        output.append(summary)
    return output


@router.get("/listings/export.csv")
def export_listings_csv(
    flagged_only: bool = False,
    platform: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = _visible_listings(db)
    if platform:
        query = query.filter(models.Listing.platform == platform)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        ["id", "product_name", "platform", "scraped_at", "compliant", "missing_fields"]
    )
    for listing in query.order_by(models.Listing.id.desc()).all():
        summary = _summarise(listing)
        if flagged_only and summary["compliant"]:
            continue
        writer.writerow(
            [
                summary["id"],
                summary["product_name"],
                summary["platform"],
                summary["scraped_at"].isoformat() if summary["scraped_at"] else "",
                "yes" if summary["compliant"] else "no",
                "; ".join(summary["missing_fields"]),
            ]
        )
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=listings.csv"},
    )


def _get_visible_or_404(db: Session, listing_id: int) -> models.Listing:
    listing = (
        db.query(models.Listing)
        .filter(
            models.Listing.id == listing_id,
            models.Listing.deleted_at.is_(None),
        )
        .options(selectinload(models.Listing.results))
        .first()
    )
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found.")
    return listing


@router.get("/listings/{listing_id}", response_model=schemas.ListingDetailOut)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listing = _get_visible_or_404(db, listing_id)
    by_field = {r.field_name: r for r in listing.results}

    results = []
    for field in _RULE_ORDER:
        row = by_field.get(field)
        results.append(
            {
                "field": field,
                "present": bool(row.is_present) if row else False,
                "matched_text": row.matched_text if row else None,
                "description": _RULE_DESCRIPTIONS.get(field, ""),
                "legal_reference": _RULE_REFERENCES.get(field, ""),
            }
        )

    summary = _summarise(listing)
    return {
        "id": listing.id,
        "product_name": listing.product_name,
        "platform": listing.platform,
        "scraped_at": listing.scraped_at,
        "raw_ocr_text": listing.raw_ocr_text,
        "missing_fields": summary["missing_fields"],
        "compliant": summary["compliant"],
        "results": results,
    }


@router.get("/listings/{listing_id}/image")
def get_listing_image(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listing = _get_visible_or_404(db, listing_id)
    if not listing.image_path or not os.path.exists(listing.image_path):
        raise HTTPException(status_code=404, detail="Image file not found.")
    return FileResponse(listing.image_path)


@router.delete("/listings/{listing_id}", status_code=204)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listing = _get_visible_or_404(db, listing_id)
    listing.deleted_at = models._utcnow()
    db.commit()
    return None
