# MASTER PROJECT SPECIFICATION
## Automated Legal Metrology Compliance Checker for E-Commerce Listings

**Purpose of this document:** This is the single source of truth for this project. It contains the problem domain, the legal background, the full architecture, every technical layer with working code, the deployment plan, the cost plan, and the lifecycle plan. Anyone (human or AI) reading only this file should understand the entire project well enough to build it, extend it, deploy it, or advise on it — with no other context needed.

**Project status:** Not yet started. This is the complete plan before writing the first line of code.

**Builder profile:** Solo student developer, building this as a personal portfolio project (not for a hackathon — a different idea was chosen for that). Zero budget — must use only genuinely free tools, plus GitHub Student Developer Pack benefits (confirmed available: includes DigitalOcean $200/60-day trial credit, GitHub Pro, and other perks). Beginner-to-intermediate skill level; comfortable following structured code but new to full-stack architecture, OCR, and legal-domain software.

---

## PART 1: THE PROBLEM DOMAIN

### 1.1 Origin of the idea

This project is based on a real Smart India Hackathon (SIH) 2025 problem statement — **SIH25057**, "Automated Compliance Checker for Legal Metrology Declarations on E-Commerce Platforms" — issued by India's **Ministry of Consumer Affairs, Food & Public Distribution**, specifically its **Department of Consumer Affairs**. It is NOT being built for the hackathon (a different idea was chosen for that); it is being built independently as a personal project because the domain and technical scope are a strong learning vehicle.

### 1.2 The ministry and department context

India's central government organizes work into **ministries** (broad policy areas, headed by a Cabinet minister) split into **departments** (narrower focus areas). The Ministry of Consumer Affairs, Food & Public Distribution has two departments:

- **Department of Consumer Affairs (DoCA)** — protects buyers. Handles consumer protection policy, price monitoring of essential goods, the Bureau of Indian Standards, consumer grievance redress, and **Legal Metrology** (the law of weights, measures, and packaged-goods labelling). **This project is DoCA's domain.**
- **Department of Food & Public Distribution (DFPD)** — food security. Runs the Public Distribution System (PDS): the Food Corporation of India (FCI) buys grain at Minimum Support Price, stores/transports it, and distributes it via ~5.4 lakh Fair Price Shops to beneficiaries under the National Food Security Act, 2013. **This project has nothing to do with DFPD** — it just shares a ministry with it. Do not confuse the two.

### 1.3 The law being enforced

- **Legal Metrology Act, 2009** — establishes and enforces standards of weights/measures in trade; protects consumers from fraud like short-weighting and hidden pricing.
- **Legal Metrology (Packaged Commodities) Rules, 2011 ("LMPC Rules")** — the detailed rules under that Act. **Rule 6** lists mandatory declarations every pre-packaged retail product must carry:
  1. Name and address of manufacturer/packer/importer
  2. Common/generic name of the commodity
  3. Net quantity in standard units (grams/kg for weight, ml/litres for volume, or count)
  4. MRP (Maximum Retail Price), inclusive of all taxes
  5. Month and year of manufacture/packing/import
  6. Country of origin (mandatory for imports)
  7. Consumer care details (name/address/phone/email for complaints)
  8. Unit sale price (price per standard unit, e.g., ₹/kg, for comparison shopping)
- **Rule 6(10)** (effective since 1 January 2018) extends these same declarations (except month/year of manufacture) to **e-commerce listings** — the online listing (image or description) must show what a physical label would show, before purchase. In the marketplace model, the seller/manufacturer is primarily responsible; platforms must exercise due diligence.
- The rules are periodically amended — e.g., a **Draft LMPC (Second) Amendment Rules, 2025** proposes mandatory searchable/sortable country-of-origin filters on e-commerce platforms, showing the policy direction is toward more automated, data-driven oversight (which is exactly what this project builds toward).

### 1.4 The real-world scale of the problem

- India's e-commerce market was valued around **Rs. 10,82,875 crore (~US$125 billion) in 2024** (IBEF, citing ANAROCK–ETRetail), with over a million active sellers on major platforms and hundreds of millions of listings — far beyond what manual inspection can cover.
- Documented enforcement activity (illustrates the gap this project addresses, not something the project itself performs):
  - Oct 2020: Notices served to Amazon and Flipkart for missing country-of-origin declarations.
  - 448 notices issued Oct 2020–Jul 2022 (38 in 2020, 232 in 2021, 178 in first half of 2022), with ~₹77.9 lakh recovered as compounding fees (Lok Sabha reply, 21 Jul 2022).
  - 183 notices in the 12 months to Aug 2021 specifically for country-of-origin violations.
  - **997 notices issued since 2020** (as of 18 Mar 2026), with **₹1,440+ crore in consumer refunds facilitated** — one of the department's largest recent achievements (Minister Pralhad Joshi, Lok Sabha).
  - One state alone: 516 declaration-violation cases in 2024–25, 364 compounded for ~₹11 crore in fees.

### 1.5 What this project does about it

It is **software-only** (no hardware, no physical testing, no scientific-domain expertise required): a pipeline that ingests product listing images/text, extracts the declared text via OCR, checks it against the Rule 6 requirements using a rule engine, stores results, and shows a dashboard of flagged non-compliant listings, violation trends, and a searchable log — the kind of automated, scalable check human inspectors cannot do at e-commerce's scale.

### 1.6 Why this problem was a good fit (context, not a build requirement)

Perceived as "boring" government-compliance work compared to flashy consumer apps, so it's historically under-subscribed at hackathons — but it's technically approachable (pure software, modular pipeline, clear legal spec to translate into rules) and directly aligned with where government policy is already heading (automated enforcement tooling).

---

## PART 2: SCOPE AND DATA-SOURCING DECISION

### 2.1 Explicitly out of scope

- **Live scraping of Amazon/Flipkart.** Automated access violates their Terms of Service, risks IP bans/legal exposure, and is not something a personal project should depend on long-term.
- Any dependency on a paid API/service as a hard requirement (see Part 6, budget constraint is $0 baseline).

### 2.2 Data sourcing strategy (in order of preference)

1. **Public datasets** — POIE (product-label images, ~3,000 images), Kaggle "Product Listing From Amazon India" (~30,000 records: title, brand, pack size, MRP, price, image URLs), Grocery Store Dataset (~5,125 grocery images). None are India-Legal-Metrology-specific, so treat as a starting point, not a perfect fit.
2. **Self-collected images** — photographing real Indian product labels (fully legal, most realistic, recommended primary source).
3. **Manual submission pattern (architecturally preferred for realism)** — design the ingestion layer as a generic "accept an image + optional text" function, so a future browser extension or upload form (a human pastes a listing URL/screenshot) can feed it without ever needing a scraper. This is closer to how real regulator tooling is built.
4. Amazon Product Advertising API exists but requires an active Associates account with sales activity — not relied upon here.

**Design implication:** the ingestion layer must be a swappable module (function: image + metadata → listing record) so the data source can change without touching OCR/rules/DB/API/frontend.

---

## PART 3: FULL SYSTEM ARCHITECTURE

### 3.1 Data flow (top-level)

```
Data source (dataset / self-collected images / manual upload)
        │
        ▼
OCR + Preprocessing  (OpenCV cleans image → Tesseract/EasyOCR extracts text, with per-word confidence)
        │
        ▼
Rule Engine  (YAML-defined regex rules check text against LMPC Rule 6 declarations)
        │
        ▼
PostgreSQL Database  (via SQLAlchemy models + Alembic migrations)
        │
        ▼
FastAPI Backend  (REST API, JWT-authenticated, routers for ingest/listings/stats)
        │
        ▼
React Frontend  (dashboard: flagged-listings table, violation trend chart, search, login)
```

### 3.2 Component responsibilities

| Layer | Responsibility | Core tools |
|---|---|---|
| Data | Provide images + basic metadata (platform, product name) | Sample datasets, self-collected photos |
| OCR | Convert label image → machine-readable text, with confidence scores | Tesseract (via pytesseract), EasyOCR, OpenCV |
| Rules | Check extracted text against each Rule 6 declaration | Python `re`, rules defined in `rules.yaml` |
| Database | Persist listings and per-field compliance results | PostgreSQL, SQLAlchemy, Alembic |
| Backend API | Orchestrate ingest→OCR→rules→DB, serve data, auth | FastAPI, JWT (python-jose, passlib) |
| Frontend | Human-usable dashboard for a regulator persona | React (Vite), TanStack Query, Recharts, shadcn/ui or MUI |
| DevOps | Reproducibility, testing, deployment | Docker, docker-compose, pytest, GitHub Actions |

### 3.3 Why each major choice was made

- **PostgreSQL over SQLite:** real relational DB with migrations — matches how production systems are actually built, and DigitalOcean Managed Postgres (or a self-hosted container) is what will run in deployment.
- **Regex rule engine over ML-first approach:** transparent, explainable, fast to extend (new legal requirement = new YAML entry), doesn't require training data to start. ML is added later as a genuine enhancement, not the core mechanism.
- **FastAPI over Flask:** built-in Pydantic validation, automatic interactive API docs (`/docs`), async support, and it's what the auth/testing examples in this spec are built around.
- **React + Vite over plain HTML/JS:** component reusability for a data-heavy dashboard (table + chart + search), large ecosystem (TanStack Query, Recharts).
- **Docker + docker-compose:** the whole stack (backend, frontend, DB) starts with one command, locally or on a deploy target — critical since this must run identically on the student's laptop and on DigitalOcean.

---

## PART 4: PREREQUISITES AND ENVIRONMENT SETUP

### 4.1 Tools to install locally

| Tool | Purpose | Verify with |
|---|---|---|
| Python 3.11+ | backend, OCR, rules | `python --version` |
| Node.js (latest LTS) + npm | frontend | `node --version` |
| Git | version control | `git --version` |
| Tesseract OCR engine | OCR binary (pytesseract wraps this) | `tesseract --version` |
| Docker Desktop | containerization (free for personal/student/education use) | `docker --version` |
| VS Code | editor | — |
| Postman or VS Code "Thunder Client" extension | manual API testing | — |

### 4.2 Tesseract install commands

```bash
# Windows: installer from https://github.com/UB-Mannheim/tesseract/wiki
# (note the install path, e.g. C:\Program Files\Tesseract-OCR)

# Mac
brew install tesseract

# Ubuntu / Debian / WSL
sudo apt-get update && sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-hin   # optional: Hindi language pack
```
Windows-only extra line in Python code:
```python
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
```

### 4.3 Accounts needed

- **GitHub** (already have — Student Pack confirmed active)
- **DigitalOcean** — sign up via Student Pack for $200/60-day trial credit
- **Vercel** — free Hobby plan, sign in with GitHub, no card needed
- Kaggle (optional, for sample dataset download)

### 4.4 Team

Solo project. All roles (backend/OCR/rules, frontend/dashboard, data/testing) are done by one person, sequentially by layer (see Part 9 roadmap) rather than in parallel.

---

## PART 5: FULL REPOSITORY STRUCTURE

```
compliance-checker/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app startup, includes routers
│   │   ├── config.py          # settings loaded from .env
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # SQLAlchemy tables (Listing, ComplianceResult, User)
│   │   ├── schemas.py         # Pydantic request/response shapes
│   │   ├── ocr.py             # preprocessing + text extraction
│   │   ├── rules.py           # rule-loading + checking logic
│   │   ├── rules.yaml         # the actual Rule 6 declarations as regex
│   │   ├── auth.py            # login, JWT creation/verification
│   │   └── routers/
│   │       ├── listings.py
│   │       ├── ingest.py
│   │       └── stats.py
│   ├── tests/
│   │   ├── test_rules.py
│   │   └── test_api.py
│   ├── migrations/            # Alembic
│   ├── sample_data/
│   │   └── images/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                # axios instance, endpoint functions
│   │   ├── hooks/               # useListings, useTrends
│   │   ├── components/          # ListingsTable, ViolationChart, Login
│   │   ├── pages/                # Dashboard, LoginPage
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                     # VITE_API_URL=...
│   ├── package.json
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── tests.yml            # CI: run pytest on every push
├── docker-compose.yml           # wires backend + frontend + Postgres together
└── README.md
```

---

## PART 6: LAYER-BY-LAYER TECHNICAL SPEC AND CODE

### 6.1 OCR + Preprocessing (`backend/app/ocr.py`)

Preprocessing matters because Tesseract reads clean, high-contrast, straight text best; real product photos are skewed/noisy, so OpenCV cleans the image first.

```python
import cv2
import pytesseract
from pytesseract import Output

def preprocess_image(path: str):
    img = cv2.imread(path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (3, 3), 0)
    thresh = cv2.adaptiveThreshold(
        blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 31, 2
    )
    return thresh

def extract_text(path: str) -> str:
    processed = preprocess_image(path)
    return pytesseract.image_to_string(processed, lang="eng")

def extract_text_with_confidence(path: str):
    """Structured extraction: per-word text + confidence, so low-confidence
    words can be discarded before they reach the rule engine."""
    processed = preprocess_image(path)
    data = pytesseract.image_to_data(processed, output_type=Output.DICT)
    return [
        (data["text"][i], data["conf"][i])
        for i in range(len(data["text"])) if data["text"][i].strip()
    ]

def is_blurry(image_path: str, threshold: float = 100.0) -> bool:
    """Cheap, training-free 'AI polish': flags images too blurry for
    reliable OCR so they route to manual review instead of a false verdict."""
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    variance = cv2.Laplacian(img, cv2.CV_64F).var()
    return variance < threshold
```

**Engine choice:** default to Tesseract (free, offline, well-documented). Optionally compare against **EasyOCR** (`pip install easyocr`; `easyocr.Reader(['en','hi'])`) on real sample images — it tends to do better on natural photos and supports Hindi, at the cost of being slower/heavier. Do not default to cloud OCR APIs (Google Vision/AWS Textract/Azure) — they have free tiers but typically require a card on file, which conflicts with the zero-budget constraint; they are optional future fallbacks only.

### 6.2 Rule Engine (`backend/app/rules.yaml` + `backend/app/rules.py`)

Rules live in YAML, not hardcoded, so updating them (e.g., when the government amends the LMPC Rules) doesn't require touching application logic.

```yaml
# backend/app/rules.yaml
mrp:
  pattern: "(mrp|m\\.r\\.p\\.?).{0,15}(₹|rs\\.?)\\s?\\d+(\\.\\d{1,2})?"
  description: "Maximum Retail Price, inclusive of all taxes"
  legal_reference: "LMPC Rules 2011, Rule 6(1)(f)"

net_quantity:
  pattern: "\\d+(\\.\\d+)?\\s?(g|kg|ml|l|litre|gram|gm)\\b"
  description: "Net quantity in standard units"
  legal_reference: "LMPC Rules 2011, Rule 6(1)(c)"

country_of_origin:
  pattern: "(country of origin|made in)\\s*[:\\-]?\\s*\\w+"
  description: "Required for imported goods"
  legal_reference: "LMPC Rules 2011, Rule 6(1)(h)"

consumer_care:
  pattern: "(consumer care|customer care|contact us)"
  description: "Consumer complaint contact details"
  legal_reference: "LMPC Rules 2011, Rule 6(1)(e)"

manufacturer_address:
  pattern: "\\d{6}"
  description: "Manufacturer/packer/importer address (checked via PIN code presence)"
  legal_reference: "LMPC Rules 2011, Rule 6(1)(a)"

month_year:
  pattern: "(0[1-9]|1[0-2])[\\/\\-\\s](20\\d{2})"
  description: "Month and year of manufacture or packing"
  legal_reference: "LMPC Rules 2011, Rule 6(1)(g)"
```

```python
# backend/app/rules.py
import yaml, re

def load_rules(path="app/rules.yaml") -> dict:
    with open(path) as f:
        return yaml.safe_load(f)

def check_compliance(text: str, rules: dict) -> dict:
    text_lower = text.lower()
    results = {}
    for field, rule in rules.items():
        match = re.search(rule["pattern"], text_lower, re.IGNORECASE)
        results[field] = {
            "present": bool(match),
            "matched_text": match.group(0) if match else None,
            "legal_reference": rule["legal_reference"],
        }
    return results
```

```python
# backend/tests/test_rules.py
from app.rules import check_compliance, load_rules

rules = load_rules("app/rules.yaml")

def test_mrp_detected():
    result = check_compliance("MRP: Rs. 199 (incl. of all taxes)", rules)
    assert result["mrp"]["present"] is True

def test_mrp_missing():
    result = check_compliance("Net Qty: 500g", rules)
    assert result["mrp"]["present"] is False

def test_country_of_origin_detected():
    result = check_compliance("Country of Origin: India", rules)
    assert result["country_of_origin"]["present"] is True
```

### 6.3 Database (`backend/app/models.py`, `database.py`, Alembic)

```python
# backend/app/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base
import datetime

Base = declarative_base()

class Listing(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True)
    platform = Column(String)          # "Amazon" / "Flipkart" / "Sample"
    product_name = Column(String)
    image_path = Column(String)
    raw_ocr_text = Column(String)
    scraped_at = Column(DateTime, default=datetime.datetime.utcnow)

class ComplianceResult(Base):
    __tablename__ = "compliance_results"
    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.id"))
    field_name = Column(String)        # "mrp", "net_quantity", etc.
    is_present = Column(Boolean)
    matched_text = Column(String, nullable=True)
    checked_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    hashed_password = Column(String)
```

```python
# backend/app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://compliance:compliance@localhost:5432/compliance_db"
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
```

Migrations (run once, then after every model change):
```bash
pip install alembic psycopg2-binary
alembic init migrations
# edit migrations/env.py to import Base from app.models and point at DATABASE_URL
alembic revision --autogenerate -m "initial tables"
alembic upgrade head
```

### 6.4 Backend API (`backend/app/main.py`, `routers/`, `auth.py`)

```python
# backend/app/main.py
from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from .ocr import extract_text
from .rules import check_compliance, load_rules
from .database import SessionLocal
from .models import Listing, ComplianceResult
import shutil

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to the Vercel URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)
RULES = load_rules("app/rules.yaml")

@app.post("/ingest")
async def ingest_listing(file: UploadFile, platform: str = Form(...), product_name: str = Form(...)):
    db = SessionLocal()
    save_path = f"sample_data/images/{file.filename}"
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    text = extract_text(save_path)
    listing = Listing(platform=platform, product_name=product_name,
                       image_path=save_path, raw_ocr_text=text)
    db.add(listing); db.commit(); db.refresh(listing)

    results = check_compliance(text, RULES)
    for field, r in results.items():
        db.add(ComplianceResult(listing_id=listing.id, field_name=field,
                                 is_present=r["present"], matched_text=r["matched_text"]))
    db.commit()
    return {"listing_id": listing.id, "results": results}

@app.get("/listings")
def get_listings(flagged_only: bool = False):
    db = SessionLocal()
    output = []
    for l in db.query(Listing).all():
        results = db.query(ComplianceResult).filter_by(listing_id=l.id).all()
        missing = [r.field_name for r in results if not r.is_present]
        if flagged_only and not missing:
            continue
        output.append({"id": l.id, "product_name": l.product_name,
                        "platform": l.platform, "missing_fields": missing})
    return output

@app.get("/stats/trends")
def get_violation_trends():
    db = SessionLocal()
    counts = {}
    for r in db.query(ComplianceResult).filter_by(is_present=False).all():
        counts[r.field_name] = counts.get(r.field_name, 0) + 1
    return counts
```

**Authentication (concept + libraries):** `pip install "python-jose[cryptography]" "passlib[bcrypt]"`. Pattern: `User` table with a bcrypt-hashed password → `/login` endpoint checks credentials, returns a signed JWT → a FastAPI dependency validates that JWT on protected routes (`/listings`, `/stats/trends`). FastAPI's own documentation has a complete worked example of this exact pattern.

```python
# backend/tests/test_api.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_listings_endpoint_returns_list():
    response = client.get("/listings")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### 6.5 Frontend (`frontend/src/...`)

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install axios @tanstack/react-query recharts react-router-dom
```

```jsx
// src/hooks/useListings.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useListings(flaggedOnly) {
  return useQuery({
    queryKey: ["listings", flaggedOnly],
    queryFn: () =>
      axios.get(`${import.meta.env.VITE_API_URL}/listings?flagged_only=${flaggedOnly}`)
        .then(r => r.data),
  });
}
```

```jsx
// src/components/ListingsTable.jsx
import { useListings } from "../hooks/useListings";

function ListingsTable() {
  const { data: listings = [] } = useListings(true);
  return (
    <table>
      <thead><tr><th>Product</th><th>Platform</th><th>Missing Fields</th></tr></thead>
      <tbody>
        {listings.map(item => (
          <tr key={item.id}>
            <td>{item.product_name}</td>
            <td>{item.platform}</td>
            <td>{item.missing_fields.join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export default ListingsTable;
```

```jsx
// src/components/ViolationChart.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function ViolationChart() {
  const [data, setData] = useState([]);
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/stats/trends`).then(res => {
      setData(Object.entries(res.data).map(([field, count]) => ({ field, count })));
    });
  }, []);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="field" /><YAxis /><Tooltip />
        <Bar dataKey="count" fill="#d9534f" />
      </BarChart>
    </ResponsiveContainer>
  );
}
export default ViolationChart;
```

`frontend/src/api.js`:
```javascript
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const apiClient = axios.create({ baseURL: API_BASE_URL });
```

UI polish: shadcn/ui (Tailwind-based) or Material UI, either is free/open-source.

### 6.6 Optional ML layer

- **Now-worth-doing baseline:** the `is_blurry()` function in 6.1 — zero training data needed, immediately useful (routes bad images to manual review instead of a wrong verdict).
- **Real ML, when there's time and ~100–200 labelled examples:** TF-IDF + Logistic Regression text classifier (`scikit-learn`) to catch borderline phrasing regex misses (e.g., "Net Wt." vs "Net Quantity").
```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2)
vectorizer = TfidfVectorizer()
X_train_vec = vectorizer.fit_transform(X_train)
model = LogisticRegression().fit(X_train_vec, y_train)
print("Accuracy:", model.score(vectorizer.transform(X_test), y_test))
```
Do not reach for a neural network/transformer unless the simple model's accuracy is genuinely insufficient — an explainable model is more valuable here than a marginally-more-accurate black box.

---

## PART 7: DEVOPS — DOCKER, CI, DEPLOYMENT

### 7.1 Dockerfiles

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y tesseract-ocr && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

`backend/requirements.txt`:
```
fastapi
uvicorn
pytesseract
opencv-python
pillow
sqlalchemy
alembic
psycopg2-binary
pandas
python-multipart
pyyaml
python-jose[cryptography]
passlib[bcrypt]
pytest
httpx
```

### 7.2 docker-compose.yml (repo root)

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: compliance
      POSTGRES_PASSWORD: compliance
      POSTGRES_DB: compliance_db
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]

  backend:
    build: ./backend
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://compliance:compliance@db:5432/compliance_db
    ports: ["8000:8000"]

  frontend:
    build: ./frontend
    ports: ["5173:5173"]

volumes:
  pgdata:
```
Local start: `docker compose up` → backend on `:8000`, frontend on `:5173`.

### 7.3 CI (`.github/workflows/tests.yml`)

```yaml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: sudo apt-get install -y tesseract-ocr
      - run: pip install -r backend/requirements.txt
      - run: pytest backend/tests
```

### 7.4 Deployment (Year 1, on Student Pack)

**Backend → DigitalOcean App Platform** (using the $200/60-day trial credit from GitHub Student Pack):
1. Redeem the DigitalOcean offer at education.github.com/pack, sign up via GitHub, credit appears automatically.
2. DigitalOcean dashboard → Apps → Create App → Source: GitHub → select repo/branch.
3. Provide the root `docker-compose.yml` (or point at `backend/Dockerfile` if deploying backend as its own app).
4. Set environment variables: `DATABASE_URL`, plus DB credentials.
5. Optionally provision **DigitalOcean Managed PostgreSQL** instead of a containerized DB (cleaner, auto-backed-up) — current pricing: **no free tier**, starts at **$15.15/month** for a single-node 1 GiB cluster (as of mid-2026); the $200 trial credit covers this for well over a year of runtime on its own.
6. Deploy → get a URL like `https://compliance-backend-xxxxx.ondigitalocean.app`.

**Frontend → Vercel** (free Hobby plan, no card, no expiration):
1. vercel.com → Sign in with GitHub → New Project → select repo → Root Directory: `frontend/`.
2. Environment variable: `VITE_API_URL` = the DigitalOcean backend URL.
3. Deploy → auto-redeploys on every push to `main`.

### 7.5 Known deployment gotchas

| Problem | Fix |
|---|---|
| CORS error, frontend can't reach backend | `CORSMiddleware` with `allow_origins` including the Vercel URL |
| Backend URL changes after redeploy | Always read it from an env var, never hardcode |
| Tesseract missing in container | `RUN apt-get install -y tesseract-ocr` in Dockerfile (already included above) |
| Vercel build fails to detect React | Confirm Root Directory is set to `frontend/` and `package.json`/`vite.config.js` exist there |

---

## PART 8: BUDGET AND LIFECYCLE PLAN

### 8.1 Confirmed genuinely free (no card required, no expiry)

Python, Node.js, Git, VS Code, Tesseract, EasyOCR, OpenCV, FastAPI, React, PostgreSQL (self-run), Docker Desktop (personal/student use), GitHub (public/private repos + CI minutes), **Vercel Hobby plan (confirmed free forever for personal projects, no card)**.

### 8.2 Avoid (either no longer free, or risk of surprise charges)

- **Railway** — no longer has a sustainable free tier; one-time $5 trial credit only, then billed.
- **Fly.io** — free allowances cut back significantly since 2024; sources conflict on whether a card is required even to trial it.
- **Cloud OCR APIs** (Google Vision/AWS Textract/Azure) — free tiers exist but typically require a card on file; unnecessary since Tesseract/EasyOCR are sufficient and fully free.
- **Custom domain names** — skip; free `*.vercel.app` / `*.ondigitalocean.app` subdomains are enough.

### 8.3 Year 1 (on GitHub Student Pack)

- DigitalOcean: $0 out of pocket, funded by the **$200 / 60-day trial credit** (redeemed via the Student Pack). Note: DigitalOcean's trial credit window is **60 days**, not a full year — budget accordingly; a $15/month Managed Postgres + a small App Platform instance comfortably fits within that credit, but track usage rather than assuming a full 12 months of runway on a single $200 grant.
- Vercel: $0, permanently free Hobby plan.
- **Total Year 1 cost: $0**, provided the 60-day credit window is actively managed (see 8.4).

### 8.4 What happens when the credit runs out

- DigitalOcean requires a card at signup; once the trial credit is exhausted, charges begin on that card unless the app/database is torn down first. Set a reminder well before the 60-day mark (not 11 months — correct this from earlier guidance: the DigitalOcean student offer is a 60-day trial, so plan around that shorter window) to decide: pay, downgrade, or shut down.
- **Cheapest keep-it-alive path:** move Postgres into a Docker container running on a single **DigitalOcean Basic Droplet (~$4/month)** instead of paying for Managed Postgres ($15.15/month) — no code changes needed, same `docker-compose.yml` pattern, just self-managed backups.
- **Do-nothing path ($0):** let the app be suspended when the credit runs out. The GitHub repo remains the permanent, complete artifact (full source, README with architecture and screenshots) — this is the normal, expected lifecycle for a student portfolio project and is not a negative signal to anyone reviewing it.
- Frontend on Vercel is unaffected either way — it stays live for free indefinitely.

### 8.5 Mindset

This is a portfolio project, not a production service. The goals — demonstrating full-stack + OCR + rule-engine + deployment skill, having a live clickable link during the active period, and a clean, well-documented GitHub repo afterward — are fully achieved regardless of whether the live deployment persists indefinitely.

---

## PART 9: BUILD ROADMAP (phased, no fixed deadline)

| Phase | Focus | Done when... |
|---|---|---|
| 1 | Environment + OCR basics | Tesseract and EasyOCR both run on a sample image; results compared |
| 2 | Rule engine + tests | All Rule 6 checks are in `rules.yaml`; `pytest` passes |
| 3 | Database + migrations | PostgreSQL in Docker, Alembic migrations applied, data persists across restarts |
| 4 | Backend API + auth | Can log in, `POST /ingest` an image, `GET /listings` — all tested |
| 5 | Frontend dashboard | Table + chart + login flow, using React Query, hitting the real API |
| 6 | Dockerize everything | `docker compose up` starts the whole stack from a clean checkout |
| 7 | CI + deploy | Tests run automatically on push; live on DigitalOcean + Vercel |
| 8 (ongoing) | ML polish, more languages, more rules, CSV export | Whenever there's time to keep improving it |

Build in this order — each phase produces something that actually runs end-to-end, rather than several disconnected half-finished pieces.

---

## PART 10: README TEMPLATE (for the actual repo)

```markdown
# Legal Metrology Compliance Checker for E-Commerce

An automated system to detect non-compliant product listings on Indian
e-commerce platforms using OCR, a legal rule engine, and a regulator dashboard.

**Live Demo:** [frontend link] | **API Docs:** [backend /docs link]

## The Problem
India's Legal Metrology Act, 2009 and the Legal Metrology (Packaged
Commodities) Rules, 2011 require e-commerce listings to declare MRP, net
quantity, manufacturer address, country of origin, and more — the same
information a physical product label must carry. With India's e-commerce
market valued near $125B and millions of active listings, manual compliance
checking cannot scale; the government has issued nearly 1,000 enforcement
notices since 2020. This project automates the check.

## Features
- OCR extraction from product label images (Tesseract / EasyOCR)
- Rule-based compliance checking against LMPC Rule 6, defined in an editable
  YAML config with legal citations per rule
- PostgreSQL-backed history of every listing and violation
- JWT-authenticated React dashboard: flagged listings, violation trend
  charts, searchable log
- Dockerized; CI via GitHub Actions; deployed on DigitalOcean + Vercel

## Tech Stack
Python (FastAPI, SQLAlchemy, Alembic, pytesseract, OpenCV, scikit-learn) ·
React (Vite, TanStack Query, Recharts) · PostgreSQL · Docker · GitHub Actions

## Local Setup
\`\`\`bash
docker compose up
# backend:  http://localhost:8000/docs
# frontend: http://localhost:5173
\`\`\`

## Architecture
See MASTER-PROJECT-SPEC.md for the full technical specification.
```

---

## PART 11: HOW TO USE THIS DOCUMENT

- **For a human collaborator or reviewer:** read Parts 1–3 for context, Part 6 for exact code, Part 9 for what order to build things in.
- **For an AI assistant being asked to help with this project:** every layer's exact code, file path, and dependency is in Part 6; the architecture and rationale are in Part 3; constraints (zero budget, solo student builder, no live scraping) are in Parts 2 and 8 — treat those as hard constraints when proposing changes.
- **This document should be updated** as the project evolves — if a rule changes, a library is swapped, or the deployment plan shifts, edit the relevant Part rather than letting this spec drift out of sync with the actual repo.
