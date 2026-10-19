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
    ids = [listing["id"] for listing in listings_response.json()]
    assert body["listing_id"] in ids


def test_ingest_requires_auth():
    with open(SAMPLE_IMAGE, "rb") as f:
        response = client.post(
            "/ingest",
            files={"file": ("bura_sugar_label.jpeg", f, "image/jpeg")},
            data={"platform": TEST_PLATFORM, "product_name": "Should Be Rejected"},
        )
    assert response.status_code == 401
