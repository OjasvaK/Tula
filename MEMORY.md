# Project Memory — Legal Metrology Compliance Checker

Running log of build progress against the roadmap in `MASTER-PROJECT-SPEC.md` Part 9.
Updated after each phase / meaningful chunk of work. Read this first when resuming.

**Last updated:** 2026-08-27

---

## Status at a glance

| Phase | Focus | Status |
|---|---|---|
| 1 | Environment + OCR basics | ✅ Done |
| 2 | Rule engine + tests | ✅ Done |
| 3 | Database + migrations | ✅ Done |
| 4 | Backend API + auth | ✅ Done |
| 5 | Frontend dashboard | Not started |
| 6 | Dockerize everything | Not started |
| 7 | CI + deploy | Not started |
| 8 | ML polish, more languages/rules, CSV export | Not started (ongoing/future) |

**Next action:** Start Phase 5 (frontend dashboard) — only when explicitly told to.

---

## What's been done

### Repo setup
- Built directly in this folder (not a nested `compliance-checker/` subfolder as the spec's literal tree shows) — this folder is the repo root.
- `git init` done, committing per phase.
- Python 3.14.4, Node v25, Git present. Docker Desktop installed (found at `AppData\Local\Programs\DockerDesktop`, not the default `Program Files` location) and confirmed working. Tesseract 5.5.3 installed by user at the default path.

### Phase 1 — Environment + OCR
- `backend/app/ocr.py` — preprocessing + `extract_text` (Tesseract) + `extract_text_with_confidence` + `is_blurry`.
- `backend/app/compare_ocr.py` — runs Tesseract and EasyOCR side by side on one image.
- Ran both engines on two real product-label photos (`backend/sample_data/images/`). **Finding: EasyOCR clearly outperforms Tesseract** on these real, imperfectly-lit photos — Tesseract only picked up fragments, EasyOCR correctly read manufacturer name, address, batch/packed-on/use-by labels, license number, etc. (with minor character noise). Recommend EasyOCR as the primary engine when Phase 4 wires OCR into the ingest endpoint; keep Tesseract as the fast/offline comparison baseline, matching spec 6.1's own prediction.
- **Windows gotcha:** EasyOCR's model-download progress bar crashes with `UnicodeEncodeError` on Windows' default console codepage (can't encode `█`). Fix: run with `PYTHONUTF8=1` / `PYTHONIOENCODING=utf-8`. Will resurface anywhere else Python's stdout hits that codepage on this machine.

### Phase 2 — Rule engine
- `backend/app/rules.yaml` + `backend/app/rules.py` — all 6 Rule 6 declarations (mrp, net_quantity, country_of_origin, consumer_care, manufacturer_address, month_year) as regex, each with its legal citation.
- `backend/tests/test_rules.py` — 14 pytest cases (detected/missing per field + YAML completeness + legal-reference wiring), all passing.
- Sanity-checked against real (messy) EasyOCR output from one of the sample photos — correctly flagged `mrp`, `country_of_origin`, `month_year` as missing, which matches reality (that pack is a pre-printed template left blank on those fields). Good early signal the pipeline reflects real declarations, not just clean test strings.

### Phase 3 — Database + migrations
- `backend/app/models.py` (Listing, ComplianceResult, User), `backend/app/database.py` (engine/session via `DATABASE_URL`).
- `docker-compose.yml` at repo root — **currently just the `db` (Postgres 16) service**; backend/frontend containers are deliberately deferred to Phase 6 per the roadmap.
- Alembic scaffolded in `backend/migrations/`, wired to `Base.metadata`, respects `DATABASE_URL` env var override.
- Verified for real, not just "commands ran": brought up Postgres via `docker compose up -d`, generated + applied the initial migration, inserted a test row, **restarted the db container, confirmed the row survived**, then deleted the test row.
- Docker quirk hit and fixed: `docker-credential-desktop` not found on PATH when running from this shell — fixed by adding Docker's `resources/bin` dir to PATH before invoking `docker compose`.

### Phase 4 — Backend API + auth
- `backend/app/config.py` (settings from `.env` via `python-dotenv`), `backend/app/schemas.py` (Pydantic response shapes), `backend/app/auth.py` (JWT login, password hashing), `backend/app/routers/{ingest,listings,stats}.py`, `backend/app/main.py` (wires it all up + CORS).
- All routes except `/login` and `/health` require a JWT (`Authorization: Bearer ...`). No public self-registration — `backend/app/seed_user.py` creates accounts out-of-band (this is an internal regulator tool, not a consumer product).
- **Three deliberate deviations from the spec's literal sample code**, each a real fix, not a style choice:
  1. `bcrypt` used directly instead of `passlib[bcrypt]` — passlib is unmaintained and breaks against recent bcrypt releases.
  2. `database.py`'s `get_db()` is a proper request-scoped generator dependency that closes its session. The spec's own inline `db = SessionLocal()` calls never closed the session — a real connection leak under load.
  3. `ingest.py` sanitizes uploaded filenames (`uuid4().hex` prefix + `Path(...).name` only) before saving — the spec's literal `f"sample_data/images/{file.filename}"` is a path-traversal/overwrite hole (an attacker-chosen filename like `../../x` would escape the upload dir).
- OCR wiring: `/ingest` calls `extract_text_easyocr()` (new in `ocr.py`), not Tesseract — per the Phase 1 finding. Uses a lazy singleton `easyocr.Reader` so the model loads once per process, not per request.
- `backend/tests/test_api.py` — 8 new pytest cases (login success/failure, auth-required on every protected route, and a full ingest → listings → stats round trip against the *real* sample image + real Postgres + real EasyOCR). Uses its own dedicated test user/platform tag and cleans up every row and uploaded file it creates, in a module-scoped fixture. All 22 tests (14 rules + 8 api) pass.
- Verified beyond pytest: ran the actual server with `uvicorn`, drove the full `login → ingest → listings → stats/trends` flow over real HTTP with `curl`, confirmed `missing_fields` and `stats/trends` counts matched the rule-engine results, then cleaned up the manual test listing and its uploaded file.
- Fixed one more pre-existing warning while in the area: `models.py` used `datetime.datetime.utcnow` (deprecated) as a column default; replaced with a small `_utcnow()` helper — no schema/migration change, same stored value.
- Minor version note: this environment's `fastapi`/`starlette` versions are quite recent (`fastapi==0.141.1`) — `app.routes` no longer flattens included-router routes into plain `APIRoute` objects for introspection (shows as `_IncludedRouter`); this didn't affect actual request handling, only how I sanity-checked it (switched to `TestClient` requests instead of introspecting `app.routes`).

### Data notes
- `backend/sample_data/images/` — two real product-label photos (Dhaga Mishri rock candy, Siddh Mahakal Bura sugar), used for the Phase 1 OCR comparison and Phase 2 sanity check. Committed.
- `backend/sample_data/csv/amazon_vfl_reviews.csv` — user-added Kaggle-style Amazon **review** dataset (`asin, name, date, rating, review`). Checked: it has no label/declaration fields (no MRP, net quantity, country of origin, etc.), so it doesn't fit this pipeline, which checks OCR'd label text, not review text. **Left as-is, not wired into anything, not committed.**

---

## How to resume the local environment

```bash
# Python venv (has all backend deps incl. sqlalchemy/alembic/psycopg2/pytest/opencv/pytesseract/easyocr)
.venv/Scripts/python.exe ...

# Bring Postgres back up (Docker Desktop must be running first)
docker compose up -d
# if `docker` isn't found in this shell, Docker Desktop's CLI lives at:
# C:\Users\ojasva koolwal\AppData\Local\Programs\DockerDesktop\resources\bin\

cd backend
../.venv/Scripts/python.exe -m pytest tests/ -v          # all tests (rules + api)
../.venv/Scripts/python.exe -m alembic upgrade head       # apply migrations if needed

# run the API server (PYTHONUTF8=1 avoids the Windows console encoding crash noted above)
PYTHONUTF8=1 ../.venv/Scripts/python.exe -m uvicorn app.main:app --port 8000
# docs at http://127.0.0.1:8000/docs

# there's a dev login already seeded: admin / dev-password-123 (change before any real deploy)
# to add another: ../.venv/Scripts/python.exe -m app.seed_user <username> <password>
```

---

## Decisions to keep in mind going forward

- **OCR default:** `/ingest` uses EasyOCR (`extract_text_easyocr` in `ocr.py`) as the primary text source, as of Phase 4; Tesseract (`extract_text`) remains the secondary/fast comparison, not the primary.
- **Auth:** no public signup. New accounts via `python -m app.seed_user <username> <password>` only.
- **Repo layout:** everything lives directly under this folder — don't create a nested `compliance-checker/` folder to match the spec's literal tree.
- **docker-compose.yml grows in Phase 6**, not now — don't add backend/frontend services early.
- Deviations from `MASTER-PROJECT-SPEC.md` (if any arise) should be noted here **and** reflected back into the spec per its own Part 11 instruction to keep it in sync.
