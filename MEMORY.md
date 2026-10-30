# Project Memory — Legal Metrology Compliance Checker

Running log of build progress against the roadmap in `MASTER-PROJECT-SPEC.md` Part 9.
Updated after each phase / meaningful chunk of work. Read this first when resuming.

**Last updated:** 2026-09-08

---

## Status at a glance

| Phase | Focus | Status |
|---|---|---|
| 1 | Environment + OCR basics | ✅ Done |
| 2 | Rule engine + tests | ✅ Done |
| 3 | Database + migrations | ✅ Done |
| 4 | Backend API + auth | ✅ Done |
| 5 | Frontend dashboard | ✅ Done |
| 6 | Dockerize everything | ✅ Done |
| 7 | CI + deploy | 🟡 CI done; deploy deferred |
| 8 | ML polish, more languages/rules, CSV export | Not started (ongoing/future) |

**Next action:** Phase 7's **CI half is done and green** (see its section below). Remaining Phase 7 work = **deploy** (DigitalOcean backend + Vercel frontend), still deliberately deferred until the user is ready to start DigitalOcean's 60-day trial-credit clock. Don't sign up for DigitalOcean/Vercel or push a deploy without the user explicitly restarting that conversation. A large **frontend UI/UX overhaul** landed 2026-08-30, out of roadmap — see its own section below.

---

## Phase 7 (part 1) — CI via GitHub Actions (2026-09-08)

Deploy is still out of scope (see Next action). This is CI only.

- **Remote:** `origin` = `https://github.com/OjasvaK/Automated-Legal-Metrology-Compliance-Checker-for-E-Commerce-Listings.git` (created by the user, was empty). First push done.
- **Default branch renamed `master` → `main`** locally and pushed as `main`. `git config user.name` here is `ojasvakoolwal-dev`, email `ojasvakoolwal@gmail.com`.
- **Push was rejected first time — `GH007: Your push would publish a private email address`.** The user's GitHub account had "Block command line pushes that expose my email" on. History-rewrite fixes (`git filter-branch`, `git rebase --root --exec`) are **blocked by Claude Code's safety classifier** — can't run them even with user approval. Resolution: user unchecked that setting in github.com/settings/emails; `ojasvakoolwal@gmail.com` is now visible in commit metadata on the public repo, by their choice. If this recurs, the non-rewrite path is that toggle; the rewrite path needs the user to run it themselves via `!`.
- **`.github/workflows/ci.yml`** — one job, `backend-tests`, on `ubuntu-latest`, triggers on **every push + every PR** (no branch filter). Steps:
  - Postgres 16 service container, same creds as `docker-compose.yml` (`compliance`/`compliance`/`compliance_db`); `DATABASE_URL` + a throwaway `SECRET_KEY` set as job `env`.
  - `apt-get install tesseract-ocr` (pytesseract needs the binary).
  - `actions/setup-python@v5` with `python-version: "3.14"`, `cache: pip`, `cache-dependency-path: backend/requirements.txt`.
  - `actions/cache@v4` on `~/.EasyOCR` (key `easyocr-models-v1`, static — models never change). First run was a cache miss; EasyOCR downloaded models during the test step and the cache saved for later runs.
  - Deps: `pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu` **first**, then `pip install -r requirements.txt` — same CPU-only-torch reasoning as the Dockerfile.
  - `alembic upgrade head` (creates the schema; `test_api.py` talks to real Postgres via `SessionLocal()` and assumes tables exist), then `python -m pytest tests/ -v`.
  - `defaults.run.working-directory: backend`.
- **First run: green in ~2m14s** (run id 34156018529). Install-deps 51s, tests 42s (incl. first-time EasyOCR model download), all 36 tests pass against real Postgres + real EasyOCR + real Tesseract on the runner. No `gh` CLI here — checked status via `curl https://api.github.com/repos/.../actions/runs`.

---

## Out-of-roadmap addition: URL-based image ingestion

Not part of the Part 9 phase list - added between Phase 6 and Phase 7 at the user's request, after they asked whether images could come from the internet instead of manual upload.

- `POST /ingest` now accepts `image_url` (a Form field) as an alternative to `file` — exactly one of the two must be given (400 otherwise). This is fetching one specific image resource the user points to, **not** scraping a marketplace page — crawling/parsing Amazon/Flipkart HTML remains out of scope per spec Part 2.1, untouched by this change.
- `backend/app/image_fetch.py` — the SSRF-guard module for this. Real bug hit and fixed while testing against the actual internet (not mocks): the private-IP check initially used `ip.is_reserved`, which also flags the IPv6 NAT64 well-known prefix (`64:ff9b::/96`) that a resolver can legitimately synthesize for a plain public IPv4 host — not an SSRF target. First test against `https://httpbin.org/image/jpeg` through the dockerized backend got a false "private address" rejection; traced it to `is_reserved` via `socket.getaddrinfo`, switched to the narrower `is_private`/`is_loopback`/`is_link_local`/`is_multicast`/`is_unspecified` set. Re-verified: httpbin URL now works, and a cloud-metadata URL (`169.254.169.254`) and `http://db:5432/` (the compose-internal Postgres service, reachable by name from inside the backend container) both still correctly get rejected. **If touching this file again, don't add `is_reserved` back** — it's the one property here that produces false positives.
- Redirects are not followed (`follow_redirects=False`) — a redirect could point at a private address even when the original URL passed the check (DNS-rebinding-style bypass).
- `backend/tests/test_image_fetch.py` (5 cases) tests the guard logic directly with no real network calls — deliberately, so nothing here is flaky once Phase 7's CI exists. 3 more cases in `test_api.py` cover the endpoint-level validation. All 30 tests pass.
- Frontend: `IngestForm` component (new "Add a Listing" dashboard section) — platform/product name + a toggle between file upload and image URL. On success it calls `queryClient.invalidateQueries` on both the `listings` and `trends` query keys, so the table and chart update immediately without a manual refresh. This is also the first ingest UI at all — Phase 5 explicitly deferred one.
- **Both Docker images had to be rebuilt** (`docker compose up -d --build backend` / `frontend`) to pick up these changes — running containers don't auto-reload from a code edit on disk; a stale container on the old image was the first thing hit when testing this (`file` field required error, from the pre-change code). Worth remembering any time code changes during/after Phase 6: rebuild before assuming a bug is real.
- Verified end-to-end via Playwright against the dockerized stack: both ingest modes work through the real UI, dashboard updates live, zero console/network errors.

---

## Out-of-roadmap addition: Frontend UI/UX overhaul (2026-08-30)

Between the URL-ingestion work and Phase 7, at the user's request ("website doesn't look good, few features, not easy to use"). Decisions taken with the user: public landing **+** multi-page authenticated app; **modern SaaS dashboard** look; add **Tailwind + Framer Motion + lucide-react**; backend changes allowed to be additive **plus one migration**.

### Frontend (was: 1 login page + 1 cramped Dashboard; now: multi-page app)
- **New deps** (resolved versions): `tailwindcss@4` + `@tailwindcss/vite` (v4 CSS-first — tokens live in `src/index.css` `@theme inline`, no `tailwind.config.js`), `framer-motion@13` (imports still from `framer-motion`, not `motion`), `lucide-react@1`, `clsx`. **`npm ci` needs the committed `package-lock.json`** — regenerated.
- **Vite 8 / Rolldown gotcha:** `build.rollupOptions.output.manualChunks` **must be a function**, not the `{name: [...]}` object form (that throws `manualChunks is not a function` under Rolldown). `vite.config.js` uses the function form to split `charts` (recharts) / `motion` / `react` / `vendor`. Largest chunk is `charts` ~418 kB / 119 kB gz (recharts) — no chunk over 500 kB now, old warning gone.
- **Routing** (`src/App.jsx`): `/` = public `LandingPage` (animated hero, how-it-works, the 6 declarations); `/login`; `/app` = `ProtectedRoute` → `AppLayout` (sidebar + sticky blur topbar + user menu + theme toggle) with children `index`→`Overview`, `listings`→`ListingsPage`, `listings/:id`→`ListingDetailPage`, `ingest`→`IngestPage`, `analytics`→`AnalyticsPage`, `help`→`HelpPage`; `*`→`NotFound`; `/dashboard`→redirect `/app`.
- **Design system:** `src/index.css` defines semantic CSS vars (`--bg/--surface/--line/--text/--brand/...`) for light + a `.dark` override, mapped to Tailwind utilities via `@theme inline` (`bg-surface`, `text-muted`, `border-line`, etc.). Dark mode = `class` strategy; `ThemeContext` persists to `localStorage["theme"]`; `index.html` has a pre-paint inline script to avoid FOUC. Inter font via Google Fonts `<link>`.
- **New dirs:** `src/components/ui/` (Button, Card, Badge/StatusBadge, Input/Select, Field, Spinner, Skeleton, EmptyState, Modal/ConfirmModal, StatCard, PageHeader, Accordion, SegmentedControl, ThemeToggle — barrel `index.js`), `src/components/layout/` (AppLayout, Sidebar, Topbar, navItems), `src/components/charts/` (chartTheme + ViolationBarChart, ComplianceDonut, PlatformBar, ActivityArea), `src/lib/` (cn, format, fieldMeta). Shared `src/components/FieldChecklist.jsx` used by both the ingest result and the listing detail.
- **Recharts is not theme-var aware** — `chartTheme.js` hands it concrete hex per light/dark via `useTheme()`.
- **`AnimatePresence mode="wait"` on the routed `<Outlet/>` broke form state** (new page not mounted until the old one finished exiting; a Playwright fill landed on nothing). Fixed: `AppLayout` now uses a **keyed enter-only fade** (`motion.div key={pathname}`, no `mode="wait"`, no exit). `AnimatePresence` is still used for the mobile drawer + toasts + modals.
- Landing's scroll-reveal cards use `whileInView` — fine for real users; in a `fullPage` screenshot you must scroll the page first or they stay at `opacity:0`.
- **Deleted** old `src/App.css`, `pages/Dashboard.jsx`, and `components/{LoginForm,ListingsTable,IngestForm,ViolationChart}.jsx` (folded into the new pages).
- Auth image loading: `<img>` can't send the bearer header, so `useListingImage` fetches `/listings/{id}/image` as a blob via axios and makes an object URL (revoked on unmount).

### Backend (all additive; one migration)
- `models.py`: `Listing.deleted_at` (nullable `DateTime`) + a `results` relationship to `ComplianceResult` (`cascade="all, delete-orphan"`). Migration `a1b2c3d4e5f6_add_listing_deleted_at.py` (down_revision `31aca06d3978`) — just `add_column`. Auto-applies via the existing backend Dockerfile `CMD`.
- `rules.py`: `rule_metadata(rules)` helper (field/description/legal_reference list).
- `routers/listings.py` rewritten: `GET /listings` enriched (`missing_count`, `total_fields`, `compliant`, `scraped_at`; optional `platform` + `search` params; hides soft-deleted; `selectinload`, no more N+1). New: `GET /listings/export.csv` (**declared before `/{listing_id}`** so the path param doesn't swallow it — stdlib `csv` + `StreamingResponse`), `GET /listings/{id}` (`ListingDetailOut` — per-field results merged with rules.yaml descriptions + raw OCR text), `GET /listings/{id}/image` (`FileResponse`, auth-gated), `DELETE /listings/{id}` (soft delete → 204).
- `routers/stats.py`: `GET /stats/trends` **unchanged** (still `{field: count}`). New `GET /stats/summary` (`SummaryOut`: totals, compliance_rate, most_common_violation, per-platform breakdown, dense 30-day activity series).
- `routers/rules.py` (new): `GET /rules` → `list[RuleOut]`, auth-gated. Wired in `main.py`.
- `schemas.py`: `ListingOut` enriched + new `FieldResultOut`, `ListingDetailOut`, `PlatformStat`, `ActivityPoint`, `SummaryOut`, `RuleOut`.
- `tests/test_api.py`: +6 cases (detail + citations + 404, image served + 401, soft delete hides from list & 404s, summary internal consistency, `/rules` 6 entries, CSV header). **36 tests pass** (was 30). Existing tests untouched and still green (trends still a dict; `ListingOut` still has `id`).
- CORS still `["*"]` — documented, tighten in Phase 7.

### Verified
- Backend: `pytest` 36/36 green (venv against dockerized `db`).
- Dev stack (Option B): full Playwright walkthrough — landing → login (`admin`/`dev-password-123`) → overview stat cards → ingest a real sample image (staged progress, `Listing #N` result card + toast) → listings (search filter, pagination) → detail (auth image loads, 6-field checklist + citations, raw OCR panel) → analytics (6 recharts SVGs) → help (accordion) → theme toggle persists across reload → deep link `/app/listings/:id` survives refresh → mobile slide-over nav → delete listing (row gone). **Zero console/HTTP errors.**
- **Full dockerized** (`docker compose up -d --build`): both images rebuilt clean; frontend `npm ci` picks up the new lockfile; nginx SPA fallback serves deep links; smoke test (landing/login/overview/analytics/deep-link-refresh) passes with zero errors.
- Cleaned up: walkthrough test listings soft-deleted via UI; their uploaded image files removed from `backend/sample_data/images/`.

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

### Phase 5 — Frontend dashboard
- `frontend/` scaffolded by hand (`npm init -y` + explicit installs), not via `npm create vite` — let npm resolve current-latest versions rather than guessing them for a bleeding-edge (2026) toolchain. Landed on **React 19, Vite 8, react-router-dom 7, @tanstack/react-query 5, recharts 3**.
- `src/api/client.js` — axios instance, request interceptor attaches `Authorization: Bearer <token>` from `localStorage["access_token"]`, response interceptor clears the token and redirects to `/login` on 401 (except the `/login` call itself, to avoid a redirect loop on a bad-password attempt).
- `src/api/auth.js` posts `/login` as `application/x-www-form-urlencoded` — required because the backend's `/login` is a FastAPI `OAuth2PasswordRequestForm` endpoint, not a JSON one.
- `AuthContext` (`src/context/AuthContext.jsx`) + `ProtectedRoute` gate `/` behind login; `/login` route is public.
- `ListingsTable` — search box (product/platform, client-side filter) + "flagged only" checkbox (server-side via `?flagged_only=`), flagged rows highlighted.
- `ViolationChart` — Recharts bar chart of `/stats/trends`.
- No upload/ingest UI yet — out of scope for Phase 5's done-when (table + chart + login); ingestion is still curl/API-only. Worth adding as Phase 8 polish if a live demo needs it.
- **Verified in a real browser, not just build success.** No `chromium-cli` on this Windows machine (that's the Linux-container tool the `run` skill defaults to), so used Playwright directly: `npx playwright install chromium` + a small driver script. Confirmed: unauthenticated `/` redirects to `/login`; login with the seeded `admin` account redirects back to `/`; dashboard renders correctly both against an empty DB (empty-state messages, no errors) and after ingesting a real listing (chart bars + flagged row rendered correctly, screenshots taken). Zero console/network errors either way. `npm run build` also succeeds (one expected "chunk >500kB" warning from recharts+react+router+query bundled together — normal for this stack, a Phase 8 code-splitting candidate, not a bug).
- Test listing + its uploaded image were cleaned up from the DB/disk after the browser check, same pattern as prior phases.

### Phase 6 — Dockerize everything
- `backend/Dockerfile` (`python:3.14-slim`, `apt-get install tesseract-ocr`), `frontend/Dockerfile` (multi-stage: `node:lts-alpine` build → `nginx:alpine` serve, with `frontend/nginx.conf` adding an SPA `try_files ... /index.html` fallback so client routes like `/login` don't 404 on refresh). `docker-compose.yml` now runs all three services (`db`, `backend`, `frontend`), not just `db`.
- **Real problem hit and fixed, not hypothetical:** the first build attempt installed the *default* PyPI `torch` wheel (526.6MB, CUDA build) and started pulling `nvidia_cudnn_cu13` (366MB) right after — heading toward several GB of GPU packages this CPU-only container will never use (`easyocr.Reader(..., gpu=False)`). Killed the build mid-download (`Stop-Process` on the `docker`/`docker-buildx`/`docker-compose` client PIDs — this does cancel the daemon-side BuildKit build) and fixed it: `backend/Dockerfile` now runs `pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu` in its own layer *before* `pip install -r requirements.txt`, so pip sees CPU-only torch (191.8MB) already satisfied when it resolves `easyocr`'s dependencies. Verified PyPI's `download.pytorch.org/whl/cpu` actually publishes `cp314`/`manylinux_2_28_x86_64` wheels before committing to the rebuild, since Python 3.14 is very new. **If touching this Dockerfile again: keep that install order, don't merge it back into one `pip install -r requirements.txt` line.**
- **`backend/requirements.txt`: `opencv-python` → `opencv-python-headless`.** The GUI build fails to import on slim Debian (`ImportError: libGL.so.1: cannot open shared object file` — no X11/GL there). Headless needs no such libs and is the more correct choice anyway for a server that never renders to a display. Local `.venv` switched too (uninstalled `opencv-python`, installed `opencv-python-headless`) so dev and Docker stay on the same dependency, not silently diverging.
- `docker-compose.yml`: `db` gets a `pg_isready` healthcheck; `backend` uses `depends_on: db: condition: service_healthy` so it never races Postgres startup (this exact race was a manual `pg_isready` polling loop back in Phase 3 — now the compose file handles it declaratively). Named volumes `backend_uploads` (uploaded images) and `easyocr_models` (`/root/.EasyOCR`) persist across container recreation without baking either into the image.
- `frontend/Dockerfile`: `VITE_API_URL` is passed as a build `ARG`, not a compose `environment:` var — Vite bakes `VITE_*` vars into the static bundle at build time, and it has to be a browser-reachable URL (`http://localhost:8000`, the host-mapped port), not the internal service name `http://backend:8000` which only resolves inside the Docker network.
- **Verified against a genuinely clean checkout**, not just "the build succeeded": `docker compose down -v` (drops the Postgres volume too) → `docker compose up -d --build`. Confirmed: all three containers up/healthy; backend logs show `alembic upgrade head` auto-applying the initial migration to the fresh DB before uvicorn starts, zero manual steps; seeded a login via `docker compose exec backend python -m app.seed_user admin dev-password-123`; drove the full `login → /listings` flow over real HTTP; ran a real `/ingest` through the container (EasyOCR downloaded its models at runtime into the `easyocr_models` volume) and got identical compliance results to the native run; drove the containerized frontend at `localhost:5173` with Playwright end-to-end (login redirect, dashboard render, zero console/network errors, screenshotted). Test listing + uploaded file cleaned up afterward via `docker compose exec`. Full local pytest suite (22 tests) re-run clean after the opencv-headless swap.
- Image sizes: backend 2.29GB (tesseract + torch-cpu + opencv-headless — reasonable for what it does; would have been several GB more with the CUDA build), frontend 94.3MB, postgres:16 642MB (unchanged).
- `.gitignore` now also excludes `.claude/` — a Claude Code session artifact (`scheduled_tasks.lock`) this environment created locally while waiting on the long Docker builds; not project source.

### Data notes
- `backend/sample_data/images/` — two real product-label photos (Dhaga Mishri rock candy, Siddh Mahakal Bura sugar), used for the Phase 1 OCR comparison and Phase 2 sanity check. Committed.
- `backend/sample_data/csv/amazon_vfl_reviews.csv` — user-added Kaggle-style Amazon **review** dataset (`asin, name, date, rating, review`). Checked: it has no label/declaration fields (no MRP, net quantity, country of origin, etc.), so it doesn't fit this pipeline, which checks OCR'd label text, not review text. **Left as-is, not wired into anything, not committed.**

---

## How to resume the local environment

**Option A — full dockerized stack (Phase 6, closest to how it'll actually deploy):**

```bash
# if `docker` isn't found in this shell, Docker Desktop's CLI lives at:
# C:\Users\ojasva koolwal\AppData\Local\Programs\DockerDesktop\resources\bin\
docker compose up -d --build      # first run after a Dockerfile change needs --build
docker compose ps                  # expect db (healthy), backend, frontend all Up
docker compose logs backend        # check migrations applied / uvicorn started

# fresh DB has no users - seed one (idempotent, no-ops if it already exists):
docker compose exec backend python -m app.seed_user admin dev-password-123

# http://localhost:5173 - frontend (nginx, static build)
# http://127.0.0.1:8000/docs - backend API docs

docker compose down                # stop everything, keep data (named volumes)
docker compose down -v             # stop and wipe Postgres/uploads/EasyOCR-model volumes too
```

**Option B — local dev servers against dockerized Postgres only (faster iteration, what Phases 1-5 used):**

```bash
# Python venv (has all backend deps incl. sqlalchemy/alembic/psycopg2/pytest/opencv-headless/pytesseract/easyocr)
.venv/Scripts/python.exe ...

docker compose up -d db            # just Postgres, not backend/frontend containers

cd backend
../.venv/Scripts/python.exe -m pytest tests/ -v          # all tests (rules + api)
../.venv/Scripts/python.exe -m alembic upgrade head       # apply migrations if needed

# run the API server (PYTHONUTF8=1 avoids the Windows console encoding crash noted above)
PYTHONUTF8=1 ../.venv/Scripts/python.exe -m uvicorn app.main:app --port 8000
# docs at http://127.0.0.1:8000/docs

# there's a dev login already seeded: admin / dev-password-123 (change before any real deploy)
# to add another: ../.venv/Scripts/python.exe -m app.seed_user <username> <password>

# frontend (from repo root)
cd frontend
npm run dev       # http://localhost:5173 - note: use "localhost", not "127.0.0.1" (Vite bound only IPv6 loopback here)
npm run build      # production build check
```

Don't run both options' backend/frontend at once - they'll fight over ports 8000/5173.

---

## Decisions to keep in mind going forward

- **OCR default:** `/ingest` uses EasyOCR (`extract_text_easyocr` in `ocr.py`) as the primary text source, as of Phase 4; Tesseract (`extract_text`) remains the secondary/fast comparison, not the primary.
- **Auth:** no public signup. New accounts via `python -m app.seed_user <username> <password>` only.
- **Repo layout:** everything lives directly under this folder — don't create a nested `compliance-checker/` folder to match the spec's literal tree.
- **PyTorch in any Docker context: always install CPU-only wheels from `download.pytorch.org/whl/cpu` first**, before anything that depends on torch (easyocr). Never let plain `pip install -r requirements.txt` resolve torch on its own in a container — it'll pull the CUDA build and several GB of unused `nvidia_*` packages. Applies to Phase 7's CI image too if one gets built there.
- **`opencv-python-headless`, not `opencv-python`**, everywhere (`requirements.txt` and local `.venv`) — the GUI build doesn't import on slim Linux without extra system libs, and headless is the correct choice for a server that never displays anything anyway.
- Deviations from `MASTER-PROJECT-SPEC.md` (if any arise) should be noted here **and** reflected back into the spec per its own Part 11 instruction to keep it in sync.
