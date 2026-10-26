import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def _utcnow() -> datetime.datetime:
    # datetime.utcnow() is deprecated; this keeps the same naive-UTC value
    # the DateTime (non-timezone-aware) columns below expect.
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)


class Listing(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True)
    platform = Column(String)          # "Amazon" / "Flipkart" / "Sample"
    product_name = Column(String)
    image_path = Column(String)
    raw_ocr_text = Column(String)
    scraped_at = Column(DateTime, default=_utcnow)
    # Soft delete: rows are hidden from every listing/stats query when set,
    # but the ComplianceResult history is preserved.
    deleted_at = Column(DateTime, nullable=True, default=None)

    results = relationship(
        "ComplianceResult",
        back_populates="listing",
        cascade="all, delete-orphan",
    )


class ComplianceResult(Base):
    __tablename__ = "compliance_results"
    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.id"))
    field_name = Column(String)        # "mrp", "net_quantity", etc.
    is_present = Column(Boolean)
    matched_text = Column(String, nullable=True)
    checked_at = Column(DateTime, default=_utcnow)

    listing = relationship("Listing", back_populates="results")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    hashed_password = Column(String)
