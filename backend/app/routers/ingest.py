import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, Form, UploadFile
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..config import UPLOAD_DIR
from ..database import get_db
from ..ocr import extract_text_easyocr
from ..rules import check_compliance, load_rules

router = APIRouter(tags=["ingest"])

RULES = load_rules("app/rules.yaml")

_upload_dir = Path(UPLOAD_DIR)
_upload_dir.mkdir(parents=True, exist_ok=True)


@router.post("/ingest", response_model=schemas.IngestResponse)
async def ingest_listing(
    file: UploadFile,
    platform: str = Form(...),
    product_name: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Strip any directory components and prefix a uuid so an attacker-chosen
    # filename (e.g. "../../secrets.txt") can't write outside UPLOAD_DIR or
    # overwrite another listing's image.
    safe_name = f"{uuid.uuid4().hex}_{Path(file.filename).name}"
    save_path = _upload_dir / safe_name
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    text = extract_text_easyocr(str(save_path))

    listing = models.Listing(
        platform=platform,
        product_name=product_name,
        image_path=str(save_path),
        raw_ocr_text=text,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    results = check_compliance(text, RULES)
    for field, r in results.items():
        db.add(
            models.ComplianceResult(
                listing_id=listing.id,
                field_name=field,
                is_present=r["present"],
                matched_text=r["matched_text"],
            )
        )
    db.commit()

    return {"listing_id": listing.id, "results": results}
