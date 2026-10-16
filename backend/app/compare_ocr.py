"""Phase 1 sanity check: run Tesseract and EasyOCR on the same image and
print both outputs side by side so the two engines can be eyeballed against
each other before either is wired into the rule engine.

Usage:
    python -m app.compare_ocr sample_data/images/<your_image>.jpg
"""
import sys
import time

from app.ocr import extract_text


def run_tesseract(path: str) -> tuple[str, float]:
    start = time.time()
    text = extract_text(path)
    return text, time.time() - start


def run_easyocr(path: str) -> tuple[str, float]:
    import easyocr  # imported lazily: slow to import, not needed elsewhere

    start = time.time()
    reader = easyocr.Reader(["en"], gpu=False)
    results = reader.readtext(path, detail=0)
    text = "\n".join(results)
    return text, time.time() - start


def main():
    if len(sys.argv) != 2:
        print(f"Usage: python -m app.compare_ocr <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    print(f"=== Tesseract ({image_path}) ===")
    tess_text, tess_time = run_tesseract(image_path)
    print(tess_text.strip() or "(no text detected)")
    print(f"--- took {tess_time:.2f}s ---\n")

    print(f"=== EasyOCR ({image_path}) ===")
    easy_text, easy_time = run_easyocr(image_path)
    print(easy_text.strip() or "(no text detected)")
    print(f"--- took {easy_time:.2f}s ---\n")


if __name__ == "__main__":
    main()
