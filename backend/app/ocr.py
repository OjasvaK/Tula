import os
import cv2
import pytesseract
from pytesseract import Output

_WINDOWS_TESSERACT_DEFAULT = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.name == "nt" and os.path.exists(_WINDOWS_TESSERACT_DEFAULT):
    pytesseract.pytesseract.tesseract_cmd = _WINDOWS_TESSERACT_DEFAULT


def preprocess_image(path: str):
    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError(f"Could not read image: {path}")
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


_easyocr_reader = None


def get_easyocr_reader():
    """Lazily instantiate and cache the EasyOCR reader (model load is slow,
    ~seconds, so this must not run per-request)."""
    global _easyocr_reader
    if _easyocr_reader is None:
        import easyocr

        _easyocr_reader = easyocr.Reader(["en"], gpu=False)
    return _easyocr_reader


def extract_text_easyocr(path: str) -> str:
    """Primary text extraction path: EasyOCR outperformed Tesseract on real
    product-label photos in Phase 1 testing (see MEMORY.md)."""
    reader = get_easyocr_reader()
    results = reader.readtext(path, detail=0)
    return "\n".join(results)


def is_blurry(image_path: str, threshold: float = 100.0) -> bool:
    """Cheap, training-free 'AI polish': flags images too blurry for
    reliable OCR so they route to manual review instead of a false verdict."""
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")
    variance = cv2.Laplacian(img, cv2.CV_64F).var()
    return variance < threshold
