import shutil
import uuid
from pathlib import Path
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..config import UPLOAD_DIR
from ..database import get_db
from ..image_fetch import ImageFetchError, fetch_image_bytes
from ..ocr import extract_text_easyocr
from ..rules import check_compliance, load_rules

router = APIRouter(tags=["ingest"])

RULES = load_rules("app/rules.yaml")

_upload_dir = Path(UPLOAD_DIR)
_upload_dir.mkdir(parents=True, exist_ok=True)


def _safe_save_path(original_name: str) -> Path:
    # Strip any directory components and prefix a uuid so an attacker-chosen
    # filename (e.g. "../../secrets.txt") can't write outside UPLOAD_DIR or
    # overwrite another listing's image.
    safe_name = f"{uuid.uuid4().hex}_{Path(original_name).name or 'image'}"
    return _upload_dir / safe_name


@router.post("/ingest", response_model=schemas.IngestResponse)
async def ingest_listing(
    platform: str = Form(...),
    product_name: str = Form(...),
    file: UploadFile | None = File(None),
    image_url: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if file and image_url:
        raise HTTPException(
            status_code=400, detail="Provide either a file or an image_url, not both."
        )
    if not file and not image_url:
        raise HTTPException(
            status_code=400, detail="Provide either a file or an image_url."
        )

    if image_url:
        try:
            image_bytes = await fetch_image_bytes(image_url)
        except ImageFetchError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e
        original_name = Path(urlparse(image_url).path).name
        save_path = _safe_save_path(original_name)
        with open(save_path, "wb") as f:
            f.write(image_bytes)
    else:
        save_path = _safe_save_path(file.filename)
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
