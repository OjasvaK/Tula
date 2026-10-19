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
