FROM python:3.14-slim

# tesseract-ocr provides the `tesseract` binary pytesseract shells out to.
# opencv-python-headless (in requirements.txt) needs no GL/X11 libs, so no
# extra apt packages are needed for OpenCV.
RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Install CPU-only torch/torchvision from PyTorch's own wheel index first.
# The default PyPI wheels pull in several GB of unused NVIDIA CUDA/cuDNN
# packages, and this container never touches a GPU
# (easyocr.Reader(..., gpu=False) in app/ocr.py). Installing these first
# means pip sees them already satisfied when it resolves easyocr's deps.
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Bake EasyOCR's models into the image instead of downloading them on the
# first request. Hosts without a persistent disk (Hugging Face Spaces) would
# otherwise re-fetch them after every restart.
ENV EASYOCR_MODULE_PATH=/app/.EasyOCR
RUN python -c "import easyocr; easyocr.Reader(['en'], gpu=False)"

COPY . .

# Hugging Face Spaces runs the container as uid 1000, not root, so the
# upload and model directories must be writable by any user.
RUN mkdir -p sample_data/images && chmod -R a+rwX sample_data .EasyOCR

EXPOSE 8000

# Applies pending Alembic migrations before serving, so `docker compose up`
# works against a brand-new (empty) Postgres volume with no manual steps.
# If DEMO_USERNAME/DEMO_PASSWORD are set, also creates that account (a no-op
# once it exists), for hosts with no shell to run app.seed_user from.
CMD ["sh", "-c", "alembic upgrade head && if [ -n \"$DEMO_USERNAME\" ]; then python -m app.seed_user \"$DEMO_USERNAME\" \"$DEMO_PASSWORD\"; fi && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
