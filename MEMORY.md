# Project Memory — Legal Metrology Compliance Checker

Running log of build progress against the roadmap in `MASTER-PROJECT-SPEC.md` Part 9.
Updated after each phase / meaningful chunk of work. Read this first when resuming.

**Last updated:** 2026-08-26

---

## Status at a glance

| Phase | Focus | Status |
|---|---|---|
| 1 | Environment + OCR basics | ✅ Done |
| 2 | Rule engine + tests | ✅ Done |
| 3 | Database + migrations | ✅ Done |
| 4 | Backend API + auth | ⏳ Not started — waiting on go-ahead |
| 5 | Frontend dashboard | Not started |
| 6 | Dockerize everything | Not started |
| 7 | CI + deploy | Not started |
| 8 | ML polish, more languages/rules, CSV export | Not started (ongoing/future) |

**Next action:** Start Phase 4 (backend API + auth) — only when explicitly told to.

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
../.venv/Scripts/python.exe -m pytest tests/ -v          # rule engine tests
../.venv/Scripts/python.exe -m alembic upgrade head       # apply migrations if needed
```

---

## Decisions to keep in mind going forward

- **OCR default:** prefer EasyOCR output as the primary text source once ingest is wired up (Phase 4); Tesseract is the secondary/fast comparison, not the primary.
- **Repo layout:** everything lives directly under this folder — don't create a nested `compliance-checker/` folder to match the spec's literal tree.
- **docker-compose.yml grows in Phase 6**, not now — don't add backend/frontend services early.
- Deviations from `MASTER-PROJECT-SPEC.md` (if any arise) should be noted here **and** reflected back into the spec per its own Part 11 instruction to keep it in sync.
