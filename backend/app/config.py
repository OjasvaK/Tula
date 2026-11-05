import os

from dotenv import load_dotenv

load_dotenv()


def with_psycopg2(url: str) -> str:
    """Hosted Postgres providers (Neon, Render, ...) hand out plain
    postgresql:// or postgres:// URLs, which SQLAlchemy 2.1 maps to psycopg 3.
    Only psycopg2 is installed, so pin that driver."""
    for prefix in ("postgresql://", "postgres://"):
        if url.startswith(prefix):
            return "postgresql+psycopg2://" + url[len(prefix):]
    return url


DATABASE_URL = with_psycopg2(os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://compliance:compliance@localhost:5432/compliance_db",
))
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "sample_data/images")

# Comma-separated browser origins allowed to call the API. "*" is for local
# development only; a deploy sets the frontend's exact URL.
ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()
]
