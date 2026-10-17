import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://compliance:compliance@localhost:5432/compliance_db"
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
