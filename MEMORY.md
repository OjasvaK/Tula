# Project Memory — Legal Metrology Compliance Checker

Running log of build progress against the roadmap in `MASTER-PROJECT-SPEC.md` Part 9.
Updated after each phase / meaningful chunk of work. Read this first when resuming.

**Last updated:** 2026-11-01

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

**Next action:** Phase 7's **CI half is done and green** (see its section below). Remaining Phase 7 work = **deploy** (DigitalOcean backend + Vercel frontend), still deliberately deferred until the user is ready to start DigitalOcean's 60-day trial-credit clock. Don't sign up for DigitalOcean/Vercel or push a deploy without the user explicitly restarting that conversation. A large **frontend UI/UX overhaul** landed 2026-08-30, out of roadmap — see its own section below. **Superseded on 2026-11-01 by the "Rule Six" stamp-sheet redesign** (next section) — the dark "scanner" look and the cloth look described further down no longer exist in code. **None of the 2026-09-28 or 2026-11-01 frontend work is committed yet.**

---

## Out-of-roadmap: stamp-sheet redesign + sign-in removed (2026-11-01) — product now named **Tula**

**Renamed "Rule Six" → "Tula"** (तुला, the traditional Indian balance) at the user's choice, the same day. Mentions of "Rule Six" below are historical.


User asked for a total redesign ("look like a professional website designer made it"), using the Impeccable plugin and the design-taste-frontend skill, and earlier the same day to drop the sign-in page.

- **Sign-in page removed.** `LoginPage.jsx` deleted, `/login` route gone. `AuthContext` silently logs in the seeded demo account on load (`VITE_DEMO_USERNAME`/`VITE_DEMO_PASSWORD`, defaulting to `admin` / `dev-password-123`); `ProtectedRoute` shows "Opening the dashboard…" or an error with retry; `client.js` on 401 drops the token and reloads `/app`. Backend JWT auth is untouched. **Those demo credentials ship in the frontend bundle — change before any public deploy.**
- **Process artifacts:** `PRODUCT.md` (Impeccable product record), `.impeccable/` (surface brief with direction contract `seed:443dcbbca6e8f434`, decision sketches, review captures), `.taste-skill/` (app style sheet `framed-sheet`, inspector reports). DESIGN.md: see the finish-review notes below.
- **Product renamed "Rule Six"** (brand was confirmed fully open). Direction chosen by the user: **Definitive Stamp Sheet** — each check is a sheet of six perforated stamps, one per Rule 6 declaration; found = postmarked with its clause, missing = carmine "Not declared" overprint. Cool security-paper ground `#f3f5f6`, ink `#15233c`, stamp blue `#1f56a3`, carmine `#b0173f` only for overprints. Fonts: Mukta (text) + Rozha One (display/denominations), both Indian foundries. **Dark mode removed** on purpose (ThemeContext/ThemeToggle deleted).
- **Landing** (`LandingPage.jsx`): hero = the real Siddh Mahakal photo cut into six stamp crops (`frontend/public/specimen/*.jpg`, real crops of the project's own photo) printing in while the real EasyOCR text streams; live "Try the rules" tester runs the backend regexes ported to `src/lib/rules.js` (**keep in step with `backend/app/rules.yaml`**); law section (Rule 6(10), Lok Sabha notice figure from the spec); pipeline; the six declarations; tech stack on a blue field; stamp/weights tradition with credited open-licence photos (`frontend/public/assets/`, credits in `credits.json` and the footer).
- **App** ("framed sheet" shell: tinted frame + white sheet): KPIs as a divided strip (no icon tiles), `StampStrip` mini six-stamp strip on every listing row (signature element), tie-aware "missing most often", `DeclarationSheet` on detail + check pages (a fresh check prints its sheet), Analytics = missing-declaration bar list + platform table + per-day columns. Old recharts donut/area/platform charts deleted.
- **Gotchas hit:** (1) unlayered element CSS (`button { color: inherit }`) silently beat every Tailwind v4 utility — element defaults must live in `@layer base`; (2) the perforation mask must be the edge-only two-layer mask, a single tiled radial mask punches holes across the whole stamp; (3) the mask clips anything positioned outside the stamp, so postmarks stay inside; (4) design-taste's inspector only scrolls 12 screens — scroll reveals are disabled under 768px.
- **Verified:** `npm run build` clean; design-taste inspector 0 FAIL on landing + all 6 app screens on the production build; `impeccable detect` clean; every shipped raster has embedded provenance.
- **Finish review round 1 = "fix"** (8 items), all applied: hero recomposed as one stamp sheet (toned `--gutter` sheet, selvedge nav, double-ruled "Check a label" value box, specimen + OCR stream in the right selvedge); stamps print the *declared value* via `declaredValue()` in `lib/rules.js` (not the matched keyword); engraved double frames; crops `object-contain` in a white window with a screen-blend ink overlay; "The six" and "Under the hood" became ruled tables; KPI strip is a ledger line; missing-declaration rows use a tally of mini stamps (≤24 listings); app work sheet perforated on desktop (`.perforated-lg`) — **so `Modal` now portals to `document.body`** (a mask clips fixed descendants).
- **Finish review rounds 2–3:** phone hero became a swipeable snap row of full-size stamps (crops unreadable at 2-up); catalogue stamps use `bare` mode; md stamps reserve a 52px foot band for the postmark; address crop is now y 634–708 (it must keep the "…303301" PIN line whole). **Final disposition: ship** (scored fixes only, not a fresh full review).
- **Go-live prep (same day):** `ALLOWED_ORIGINS` env (config.py → CORS, default `*`, compose sets `http://localhost:5173`); `.env.example` documents it plus `VITE_DEMO_*`; `.gitignore` covers `.taste-skill/`, `.impeccable/{chrome-profile,review,mocks,questions}` and uploaded `backend/sample_data/images/*_*`; new `README.md` with screenshots in `docs/screenshots/`. Docker stack rebuilt and smoke-tested. The two real listings were re-ingested through the **Docker** backend (now **#34 Siddh Mahakal 3/6, #35 Dhaga Mishri 1/6**; #24/#25 soft-deleted) so their photos live in the `backend_uploads` volume — images ingested by a local uvicorn 404 inside Docker.

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

## Out-of-roadmap addition: visual identity redesign — "scanner" direction (2026-09-28, round 2)

User rejected the first animation pass ("didn't like that much... make it look different than the other world... think like a senior designer") — the issue wasn't the motion mechanics, it was that the look was a generic gradient-blob SaaS template. Second pass replaced the visual identity, not just added more motion.

- **Design direction:** leaned into what the product actually *is* — an OCR/scanner tool — instead of generic marketing gradients. Signature elements, all hand-built (no new npm dependency; canvas + framer-motion + one Google Font, deliberately, to keep the site's dependency footprint and build risk unchanged):
  - `components/motion/ScanGridCanvas.jsx` — hand-rolled `<canvas>` dot grid, every dot breathing on its own sine cycle plus glowing/growing near the cursor. This is the site's signature background, tuned to be clearly visible at rest (not just on hover) after an initial pass came in too subtle to read as "alive" against near-black — the working formula is `alpha = base(~0.14) + breathe(~0.22 amplitude) + proximity(~0.7)`; going much below that base reads as invisible in a screenshot even though it's technically animating.
  - `components/motion/ScanLaser.jsx` — a light bar sweeping top-to-bottom on loop (the copier/scanner motif), `components/motion/ScrambleText.jsx` — OCR-style decode reveal (characters cycle through noise glyphs before settling), `components/motion/RotatingWords.jsx` — auto-advancing word swap, `components/motion/CustomCursor.jsx` — dot + lagging ring replacing the native pointer on marketing surfaces (paired with the `.cursor-scanner` CSS class in `index.css`, which hides the real cursor only within `(hover: hover) and (pointer: fine)`).
  - `usePrefersReducedMotion` hook — all of the above (grid breathing, laser, cursor, scramble) explicitly check this and fall back to a static/instant render, since these are continuous, JS-driven animations the existing CSS-only `prefers-reduced-motion` override in `index.css` can't reach, and `MotionConfig reducedMotion="user"` (set at the App root from round 1) doesn't cover raw `useMotionValue`/canvas loops either.
  - JetBrains Mono added alongside Inter (`index.html` font link + `--font-mono` theme token) — used for citations, status readouts (`detected`/`not_detected`, `compliant`/`flagged`), and eyebrow tags site-wide, so the "technical audit tool" identity reads consistently, not just as a landing-page skin.
  - **`Reveal as={Card}` gotcha resurfaced and was avoided** — same trap as round 1, documented there; stayed disciplined about only passing string tags to `Reveal`'s `as` prop this round.
- **Where it landed:** `LandingPage.jsx` fully rebuilt — an always-dark cinematic hero (hardcoded `#05060b`, independent of the app's light/dark toggle) with the grid + laser + scramble headline + rotating declaration words + a mono "compliance_result.log" readout card, then a light "lifted sheet" (rounded-top panel, negative-margin overlap) for the rest of the page in the app's normal theme tokens, a numbered technical step list, a corner-bracketed stats readout, left-accent-bar declaration cards, and a dark CTA bookend panel mirroring the hero. `LoginPage.jsx`'s brand panel and `NotFound.jsx` (now fully dark, "404 / not_found.log") reskinned to match. **`AppLayout.jsx` got a very low-alpha, non-interactive version of the same grid** (`maxAlpha 0.24`, `spacing 44`, `fixed`, `interactive={false}`) so the actual dashboard feels ambiently alive too, without a cursor-reactive layer competing with real work.
- **Deliberate scope boundary (state this if asked):** `cursor-scanner`/`CustomCursor` and the always-dark treatment are marketing-surface only (Landing, Login, 404) — the authenticated dashboard keeps a normal pointer and the user's own light/dark toggle, since a regulator doing real data entry for extended sessions needs a calm, standard-feeling tool, not a themed experience. This is a conscious senior-design call (distinguish marketing-surface personality from product-surface usability), not an oversight — the ambient grid is how the shared identity still reaches the dashboard.
- **Verified:** same rigor as round 1 — `npm run build` clean, full Docker rebuild, Playwright over every route in both themes plus a dedicated pass that moves the pointer to confirm the grid's cursor-reactive glow actually fires (not just the idle breathing), zero console/network errors, screenshots reviewed directly at each tuning step (the visibility fix above was caught this way, not guessed).
- **If touching `ScrambleText` again:** settle timing is `speed=20`, per-char overlap threshold `charProgress > 2`, hero delay `80ms` — tuned down from an initial `speed=30`/`>3`/`150ms` after a screenshot caught it mid-scramble; total settle for a ~15-char string is now well under 500ms from mount.

---

## Out-of-roadmap addition: full animation/motion overhaul (2026-09-28, round 1)

Not part of the Part 9 phase list — user asked for the whole site to be "full of animations", genz-style, moving on scroll and on page/feature change. Built entirely on the framer-motion already in the stack (no new animation dependency added).

- **New shared layer:** `frontend/src/lib/motion.js` (variants: `fadeUp`/`fadeLeft`/`fadeRight`/`scaleIn`/`staggerContainer`, spring presets) + `frontend/src/components/motion/` — `Reveal` (scroll-triggered `whileInView` wrapper, used across every page for section/card/list entrances), `AnimatedNumber` (count-up on scroll-into-view, falls back to plain text for non-numeric values), `ScrollProgressBar` (top gradient bar tied to `useScroll`), `FloatingBlobs` (continuously-morphing blurred gradient blobs), `CursorGlow` (desktop-only pointer-follow light on the landing page), `Marquee` (seamless infinite ticker via a duplicated-list CSS `translateX(-50%)` loop), `Magnetic` (cursor-pull wrapper for hero CTAs), `Burst` (hand-built particle burst on a fully-compliant ingest result — no confetti library).
- **`Reveal` gotcha:** its `as` prop must be a motion-primitive tag string (`"div"`, `"section"`, `"h2"`...) resolved via `motion[as]`, **not** a custom component reference — `Reveal as={Card}` silently falls back to a bare `motion.div` and drops all of Card's styling. Wrap custom components as children instead: `<Reveal><Card>...</Card></Reveal>`. Hit this once on `ListingsPage`, caught before it shipped.
- **Cascading approach:** rather than hand-animating every page, the shared UI kit itself grew motion — `Button` (hover lift/tap scale/shiny sweep via a `.btn-sheen` CSS class, `group`-triggered), `StatCard` (spring pop-in + `AnimatedNumber`), `ThemeToggle` (spring icon morph), `Sidebar` (icon hover rotate, animated active dot) — so every page using them animates for free. Page-specific work on top: `AppLayout` page transitions upgraded to a spring (still enter-only, no `exit`/`mode="wait"` — that broke form state once already, see the Aug 30 section below) + a `ScrollProgressBar`; `LandingPage` got the heaviest treatment (parallax hero via `useScroll`/`useTransform`, `FloatingBlobs`, `CursorGlow`, gradient-text headline, a `Marquee` ticker of the six declarations, `Magnetic` CTAs, an animated stats strip); `LoginPage` got matching blobs (`mix-blend-overlay` on the brand panel so they read as tints, not flat color patches); `IngestPage` got a pulsing dropzone, an animated stage-progress bar, and the `Burst` celebration; `ListingsPage`/`FieldChecklist` rows stagger in; `AnalyticsPage`/`HelpPage`/`ListingDetailPage`/`NotFound` all wrapped in `Reveal`.
- **Accessibility:** `App.jsx` wraps the tree in framer-motion's `<MotionConfig reducedMotion="user">` so every motion-driven animation (JS-computed transforms, which the existing CSS `prefers-reduced-motion` override in `index.css` can't reach) respects the OS setting too — both layers now covered.
- **Verified:** `npm run build` clean, full Docker rebuild, Playwright pass over every route (landing incl. scrolled, login, overview, listings, ingest, analytics, help, 404) in both light and dark — **zero console/page/network errors**. Screenshots reviewed directly, not just error-count-zero.

### Unrelated bug found and fixed while rebuilding: SQLAlchemy dialect resolution
- Rebuilding the backend image mid-session (`docker compose up -d --build frontend`, which via Compose Bake also re-evaluated the backend build) surfaced `ModuleNotFoundError: No module named 'psycopg'` on `alembic upgrade head` at container start — backend wouldn't come up at all. Root cause: the unpinned `SQLAlchemy` resolved to `2.1.1` (very new), whose bare `postgresql://` URL scheme now defaults to the psycopg **v3** dialect; this project only installs `psycopg2-binary`, which the v3 dialect module doesn't use. `psycopg2` itself was present and importable fine — this was purely a dialect-resolution default change, not a missing dependency.
- **Fix:** every `DATABASE_URL`/`sqlalchemy.url` in the repo now explicitly pins `postgresql+psycopg2://` instead of bare `postgresql://` — `docker-compose.yml`, `backend/alembic.ini`, `backend/app/config.py`'s default, `.env.example`, `.github/workflows/ci.yml`. CI was at risk of the same failure on its next run (it re-resolves unpinned deps every time) even though it was last reported green on 2026-09-08 — fixed proactively, not yet re-verified against a live Actions run.
- Verified: backend container starts clean, full 36/36 pytest suite passes inside the container post-fix.
- **If a future dependency bump breaks DB connectivity again with an unfamiliar `ModuleNotFoundError` from inside SQLAlchemy's dialect loading, check for an unpinned major-version bump on `SQLAlchemy` or `psycopg2`/`psycopg` first** — this project deliberately never pins exact versions in `requirements.txt` (see Phase 6/7 notes), which is a recurring source of these "worked yesterday" surprises on rebuild.

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
