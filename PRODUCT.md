# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, both confirmed:

- **Legal Metrology officers / inspectors** (India) reviewing packaged-commodity listings on e-commerce platforms. Their job: find listings whose label is missing a mandatory Rule 6 declaration, and know which clause each gap breaks. Sessions are working sessions — ingest, scan a table, open a listing, read the citations.
- **Portfolio visitors** — recruiters, clients, stakeholders — evaluating the engineering. Their job: understand in a minute what the tool does and how it works, then try it without friction.

## Product Purpose

Automatically checks a product-label image for the six mandatory declarations required by the Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6, and reports which are missing with the exact legal citation for each. Success: a reviewer can tell a compliant listing from a non-compliant one, and why, without reading the label themselves.

## Positioning

Explainable by construction. Every result traces to a plain regex rule paired with its LMPC clause — no black-box score, no ML on the compliance call itself. OCR (EasyOCR, with Tesseract as comparison baseline) only extracts text; the decision is a citeable rule.

## Operating Context

- Input: a label photo uploaded, or an image URL fetched (SSRF-guarded). No marketplace scraping — out of scope by design.
- Workflow: ingest → OCR → rule check → stored result → listings table, per-listing detail with citations and raw OCR text, trend analytics, CSV export.
- Demo access: no sign-in screen; the frontend silently authenticates as a standing demo account. Backend JWT auth remains for a future real deployment.

## Capabilities and Constraints

- Six declarations: MRP R.6(1)(f), Net Quantity R.6(1)(c), Country of Origin R.6(1)(h), Consumer Care R.6(1)(e), Manufacturer/Packer Address R.6(1)(a) (checked via PIN code), Month & Year R.6(1)(g).
- Stack: FastAPI + PostgreSQL + Alembic backend; React 19 + Vite 8 + Tailwind 4 + framer-motion + TanStack Query + Recharts frontend; Docker Compose; GitHub Actions CI.
- Regex checks are heuristic (e.g. address = presence of a 6-digit PIN); the UI must not overstate certainty.
- Not yet deployed publicly.

## Brand Commitments

Name: **Tula** (तुला, the traditional Indian balance), chosen by the user on 2026-11-01. Mark, palette and type were open to reinvention (confirmed); the shipped identity is recorded in DESIGN.md.

## Evidence on Hand

- Two real product-label photos in `backend/sample_data/images/`.
- 36 passing backend tests; CI green.
- No testimonials, customers, usage metrics, or benchmarks exist — do not fabricate any.

## Product Principles

1. Cite, don't score — every claim on screen should be traceable to a clause.
2. Honest about heuristics — show what was read and why it was judged.
3. Zero-friction trial — a visitor reaches a working tool in one click.
4. The working surface is for work — calm, scannable, dense where needed.
