"""One-time bootstrap: create a login for the regulator dashboard.

There is deliberately no public self-registration endpoint - this is an
internal compliance tool, not a consumer product, so accounts are created
out-of-band by whoever runs the deployment.

Usage:
    python -m app.seed_user <username> <password>
"""
import sys

from .auth import hash_password
from .database import SessionLocal
from .models import User


def main():
    if len(sys.argv) != 3:
        print("Usage: python -m app.seed_user <username> <password>")
        sys.exit(1)

    username, password = sys.argv[1], sys.argv[2]
    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == username).first():
            print(f"User '{username}' already exists.")
            return
        db.add(User(username=username, hashed_password=hash_password(password)))
        db.commit()
        print(f"Created user '{username}'.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
