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

COPY . .

EXPOSE 8000

# Applies pending Alembic migrations before serving, so `docker compose up`
# works against a brand-new (empty) Postgres volume with no manual steps.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
