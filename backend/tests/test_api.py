import os

import pytest
from fastapi.testclient import TestClient

from app.auth import hash_password
from app.database import SessionLocal
from app.main import app
from app.models import ComplianceResult, Listing, User

client = TestClient(app)

TEST_USERNAME = "test_phase4_user"
TEST_PASSWORD = "test-password-123"
TEST_PLATFORM = "TestPlatform"

SAMPLE_IMAGE = os.path.join(
    "sample_data", "images", "WhatsApp Image 2026-08-14 at 2.04.49 PM.jpeg"
)


@pytest.fixture(scope="module", autouse=True)
def seed_and_clean_test_user():
    db = SessionLocal()
    db.query(User).filter(User.username == TEST_USERNAME).delete()
    db.commit()
    db.add(User(username=TEST_USERNAME, hashed_password=hash_password(TEST_PASSWORD)))
    db.commit()
    db.close()

    yield

    db = SessionLocal()
    test_listings = db.query(Listing).filter(Listing.platform == TEST_PLATFORM).all()
    image_paths = [l.image_path for l in test_listings]
    listing_ids = [l.id for l in test_listings]

    if listing_ids:
        db.query(ComplianceResult).filter(
            ComplianceResult.listing_id.in_(listing_ids)
        ).delete(synchronize_session=False)
        db.query(Listing).filter(Listing.platform == TEST_PLATFORM).delete(
            synchronize_session=False
        )
    db.query(User).filter(User.username == TEST_USERNAME).delete()
    db.commit()
    db.close()

    for path in image_paths:
        if os.path.exists(path):
            os.remove(path)


def get_token() -> str:
    response = client.post(
        "/login", data={"username": TEST_USERNAME, "password": TEST_PASSWORD}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_login_success():
    response = client.post(
        "/login", data={"username": TEST_USERNAME, "password": TEST_PASSWORD}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_wrong_password():
    response = client.post(
        "/login", data={"username": TEST_USERNAME, "password": "wrong-password"}
    )
    assert response.status_code == 401


def test_listings_requires_auth():
    response = client.get("/listings")
    assert response.status_code == 401


def test_stats_requires_auth():
    response = client.get("/stats/trends")
    assert response.status_code == 401


def test_listings_endpoint_returns_list_when_authed():
    token = get_token()
    response = client.get("/listings", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_stats_endpoint_returns_dict_when_authed():
    token = get_token()
    response = client.get(
        "/stats/trends", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), dict)


def test_ingest_and_listings_end_to_end():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    with open(SAMPLE_IMAGE, "rb") as f:
        response = client.post(
            "/ingest",
            files={"file": ("bura_sugar_label.jpeg", f, "image/jpeg")},
            data={"platform": TEST_PLATFORM, "product_name": "Test Bura Sugar"},
            headers=headers,
        )
    assert response.status_code == 200
    body = response.json()
    assert "listing_id" in body
    assert set(body["results"].keys()) == {
        "mrp",
        "net_quantity",
        "country_of_origin",
        "consumer_care",
        "manufacturer_address",
        "month_year",
    }

    listings_response = client.get("/listings", headers=headers)
    assert listings_response.status_code == 200
    rows = listings_response.json()
    ids = [listing["id"] for listing in rows]
    assert body["listing_id"] in ids
    row = next(r for r in rows if r["id"] == body["listing_id"])
    # enriched ListingOut shape
    assert set(row) >= {
        "id",
        "product_name",
        "platform",
        "missing_fields",
        "missing_count",
        "total_fields",
        "compliant",
        "scraped_at",
    }
    assert row["total_fields"] == 6
    assert row["missing_count"] == len(row["missing_fields"])
    assert row["compliant"] == (row["missing_count"] == 0)


def test_listing_detail_has_per_field_results_and_citations():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    with open(SAMPLE_IMAGE, "rb") as f:
        ingest = client.post(
            "/ingest",
            files={"file": ("bura_sugar_label.jpeg", f, "image/jpeg")},
            data={"platform": TEST_PLATFORM, "product_name": "Detail Case"},
            headers=headers,
        )
    listing_id = ingest.json()["listing_id"]

    detail = client.get(f"/listings/{listing_id}", headers=headers)
    assert detail.status_code == 200
    body = detail.json()
    assert body["id"] == listing_id
    assert "raw_ocr_text" in body
    fields = {r["field"] for r in body["results"]}
    assert fields == {
        "mrp",
        "net_quantity",
        "country_of_origin",
        "consumer_care",
        "manufacturer_address",
        "month_year",
    }
    for r in body["results"]:
        assert r["legal_reference"].startswith("LMPC Rules 2011")
        assert r["description"]

    missing_response = client.get("/listings/999999", headers=headers)
    assert missing_response.status_code == 404


def test_listing_image_served_with_auth():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    with open(SAMPLE_IMAGE, "rb") as f:
        ingest = client.post(
            "/ingest",
            files={"file": ("bura_sugar_label.jpeg", f, "image/jpeg")},
            data={"platform": TEST_PLATFORM, "product_name": "Image Case"},
            headers=headers,
        )
    listing_id = ingest.json()["listing_id"]

    assert client.get(f"/listings/{listing_id}/image").status_code == 401
    img = client.get(f"/listings/{listing_id}/image", headers=headers)
    assert img.status_code == 200
    assert img.headers["content-type"].startswith("image/")
    assert len(img.content) > 0


def test_delete_listing_is_soft_and_hides_it():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    with open(SAMPLE_IMAGE, "rb") as f:
        ingest = client.post(
            "/ingest",
            files={"file": ("bura_sugar_label.jpeg", f, "image/jpeg")},
            data={"platform": TEST_PLATFORM, "product_name": "Delete Case"},
            headers=headers,
        )
    listing_id = ingest.json()["listing_id"]

    assert client.delete(f"/listings/{listing_id}").status_code == 401
    deleted = client.delete(f"/listings/{listing_id}", headers=headers)
    assert deleted.status_code == 204

    ids = [r["id"] for r in client.get("/listings", headers=headers).json()]
    assert listing_id not in ids
    assert client.get(f"/listings/{listing_id}", headers=headers).status_code == 404


def test_summary_endpoint_is_internally_consistent():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/stats/summary").status_code == 401

    summary = client.get("/stats/summary", headers=headers)
    assert summary.status_code == 200
    body = summary.json()
    assert set(body) >= {
        "total_listings",
        "compliant_count",
        "flagged_count",
        "compliance_rate",
        "most_common_violation",
        "platforms",
        "activity",
    }
    assert body["compliant_count"] + body["flagged_count"] == body["total_listings"]
    assert len(body["activity"]) == 30


def test_rules_endpoint_lists_six_declarations():
    token = get_token()
    assert client.get("/rules").status_code == 401
    rules_response = client.get(
        "/rules", headers={"Authorization": f"Bearer {get_token()}"}
    )
    assert rules_response.status_code == 200
    rules = rules_response.json()
    assert len(rules) == 6
    for rule in rules:
        assert rule["field"]
        assert rule["description"]
        assert rule["legal_reference"].startswith("LMPC Rules 2011")


def test_csv_export_returns_csv_with_header():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/listings/export.csv").status_code == 401
    export = client.get("/listings/export.csv", headers=headers)
    assert export.status_code == 200
    assert export.headers["content-type"].startswith("text/csv")
    first_line = export.text.splitlines()[0]
    assert first_line == "id,product_name,platform,scraped_at,compliant,missing_fields"


def test_ingest_requires_auth():
    with open(SAMPLE_IMAGE, "rb") as f:
        response = client.post(
            "/ingest",
            files={"file": ("bura_sugar_label.jpeg", f, "image/jpeg")},
            data={"platform": TEST_PLATFORM, "product_name": "Should Be Rejected"},
        )
    assert response.status_code == 401


def test_ingest_requires_file_or_url():
    token = get_token()
    response = client.post(
        "/ingest",
        data={"platform": TEST_PLATFORM, "product_name": "Missing Image"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_ingest_rejects_both_file_and_url():
    token = get_token()
    with open(SAMPLE_IMAGE, "rb") as f:
        response = client.post(
            "/ingest",
            files={"file": ("bura_sugar_label.jpeg", f, "image/jpeg")},
            data={
                "platform": TEST_PLATFORM,
                "product_name": "Both Provided",
                "image_url": "https://example.com/image.jpg",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 400


def test_ingest_rejects_private_image_url():
    token = get_token()
    response = client.post(
        "/ingest",
        data={
            "platform": TEST_PLATFORM,
            "product_name": "SSRF Attempt",
            "image_url": "http://169.254.169.254/latest/meta-data/",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
