---
version: 1
slug: "frontend-src-pages-landingpage-jsx"
primary_target: "frontend/src/pages/LandingPage.jsx"
related_targets: ["frontend/src/components/layout/AppLayout.jsx"]
---

## Scope

Landing page (`/`, Persuade) and the working app shell and screens under `/app` (Operate), one world shared.

## Audience and job

Legal Metrology inspectors checking packaged-goods listings, and portfolio visitors (recruiters, clients) evaluating the engineering. Landing: understand the mechanism in seconds, try the rules, open the tool. App: ingest a label, scan which listings are flagged and why.

## Direction contract

THESIS: A label check is issued as a definitive stamp sheet — six perforated stamps, one per Rule 6 declaration, each postmarked with its clause or overprinted NOT DECLARED in carmine. Refuses the compliance-SaaS split hero with a dashboard screenshot and feature-card row.

OWN-WORLD: Cool security-paper white ground (no cream), stamp-blue and deep intaglio ink, carmine reserved for overprints, a definitive series of stamp inks (blue, green, sepia, slate). Perforated edges via masks, engraved double frames, guilloche underprint drawn in SVG, circular postmarks with wavy cancel lines struck at one fixed angle. Rozha One for denominations and display, Mukta for text, tabular figures.

STORY: Visitor sees a real label (Siddh Mahakal Bura) cut into six stamps: three issued and postmarked, three overprinted. Believes: the check is explainable and cites law. Does: tries the rules live on label text, then opens the tool to check a label.

FIRST VIEWPORT: The page is one sheet. Top selvedge carries wordmark, plain links, and the Check a label action as the sheet-value box. A large h1 set as the sheet inscription across the selvedge; one supporting sentence under it. Below, a 3x2 sheet of large stamps fills the width; each stamp's vignette is the real label crop for that declaration. The OCR text streams into the right selvedge while stamps are struck in sequence.

FORM: Definitive Stamp Sheet, assigned (position 6 of 7 on the grounded list). seed:443dcbbca6e8f434. Raises kept: streamed OCR arrival (BBS), tabular figures ruled like measurement (forge), one ink reserved for the declaration under examination (automata), every cancellation at one fixed angle (rocket).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

The sheet prints: stamps ink in one by one in reading order as the OCR lines stream; each present stamp takes a postmark strike, each missing one takes the carmine overprint. On the live tester, typing label text re-strikes stamps in real time using the same patterns as the backend.

## Unresolved

Product name confirmed by the user as "Tula" (तुला, the traditional Indian balance), replacing the interim "Rule Six".
