---
title: Tula API
emoji: ⚖️
colorFrom: yellow
colorTo: red
sdk: docker
app_port: 8000
pinned: false
---

# Tula API

The FastAPI backend for Tula: OCR on product-label photos and the Legal
Metrology Rule 6 checks. The header above is Hugging Face Spaces config; the
`Deploy backend to Hugging Face` workflow copies this folder into the Space.

Set these as Space secrets: `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_ORIGINS`,
`DEMO_USERNAME`, `DEMO_PASSWORD`. See the main README for what each one does.
