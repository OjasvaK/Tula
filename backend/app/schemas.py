from datetime import datetime

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ComplianceFieldResult(BaseModel):
    present: bool
    matched_text: str | None
    legal_reference: str


class IngestResponse(BaseModel):
    listing_id: int
    results: dict[str, ComplianceFieldResult]


class ListingOut(BaseModel):
    id: int
    product_name: str
    platform: str
    missing_fields: list[str]
    missing_count: int
    total_fields: int
    compliant: bool
    scraped_at: datetime | None


class FieldResultOut(BaseModel):
    field: str
    present: bool
    matched_text: str | None
    description: str
    legal_reference: str


class ListingDetailOut(BaseModel):
    id: int
    product_name: str
    platform: str
    scraped_at: datetime | None
    raw_ocr_text: str | None
    missing_fields: list[str]
    compliant: bool
    results: list[FieldResultOut]


class PlatformStat(BaseModel):
    platform: str
    total: int
    flagged: int
    compliance_rate: float


class ActivityPoint(BaseModel):
    date: str  # ISO date, YYYY-MM-DD
    count: int


class SummaryOut(BaseModel):
    total_listings: int
    compliant_count: int
    flagged_count: int
    compliance_rate: float
    most_common_violation: str | None
    platforms: list[PlatformStat]
    activity: list[ActivityPoint]


class RuleOut(BaseModel):
    field: str
    description: str
    legal_reference: str
