from collections import defaultdict
from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(tags=["stats"])


@router.get("/stats/trends")
def get_violation_trends(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Count missing fields only across listings that still exist (not soft-deleted).
    live_ids = {
        row.id
        for row in db.query(models.Listing.id)
        .filter(models.Listing.deleted_at.is_(None))
        .all()
    }
    counts: dict[str, int] = {}
    for r in db.query(models.ComplianceResult).filter_by(is_present=False).all():
        if r.listing_id in live_ids:
            counts[r.field_name] = counts.get(r.field_name, 0) + 1
    return counts


@router.get("/stats/summary", response_model=schemas.SummaryOut)
def get_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listings = (
        db.query(models.Listing)
        .filter(models.Listing.deleted_at.is_(None))
        .options(selectinload(models.Listing.results))
        .all()
    )

    total = len(listings)
    compliant = 0
    violation_counts: dict[str, int] = defaultdict(int)
    per_platform: dict[str, dict[str, int]] = defaultdict(lambda: {"total": 0, "flagged": 0})
    per_day: dict[str, int] = defaultdict(int)

    for listing in listings:
        missing = [r.field_name for r in listing.results if not r.is_present]
        is_compliant = len(missing) == 0 and len(listing.results) > 0
        if is_compliant:
            compliant += 1
        for field in missing:
            violation_counts[field] += 1

        platform = listing.platform or "Unknown"
        per_platform[platform]["total"] += 1
        if not is_compliant:
            per_platform[platform]["flagged"] += 1

        if listing.scraped_at:
            per_day[listing.scraped_at.date().isoformat()] += 1

    flagged = total - compliant
    most_common = (
        max(violation_counts.items(), key=lambda kv: kv[1])[0]
        if violation_counts
        else None
    )

    platforms = [
        {
            "platform": name,
            "total": stat["total"],
            "flagged": stat["flagged"],
            "compliance_rate": round(
                (stat["total"] - stat["flagged"]) / stat["total"], 4
            )
            if stat["total"]
            else 0.0,
        }
        for name, stat in sorted(per_platform.items(), key=lambda kv: -kv[1]["total"])
    ]

    # Dense 30-day activity series (zero-filled) ending today.
    today = models._utcnow().date()
    activity = []
    for offset in range(29, -1, -1):
        day = (today - timedelta(days=offset)).isoformat()
        activity.append({"date": day, "count": per_day.get(day, 0)})

    return {
        "total_listings": total,
        "compliant_count": compliant,
        "flagged_count": flagged,
        "compliance_rate": round(compliant / total, 4) if total else 0.0,
        "most_common_violation": most_common,
        "platforms": platforms,
        "activity": activity,
    }
