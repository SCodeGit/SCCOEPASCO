import fitz
import requests
import pytesseract

from PIL import Image


def extract_pdf_text(url):

    response = requests.get(url)
    response.raise_for_status()

    pdf_bytes = response.content

    doc = fitz.open(
        stream=pdf_bytes,
        filetype="pdf"
    )

    text = ""

    for page in doc:

        # Try normal text extraction first
        page_text = page.get_text()

        text += page_text + "\n"


    # Smart decision:
    # If extracted text is too small, assume scanned PDF
    if len(text.strip()) < 100:

        text = ""

        for page in doc:

            pix = page.get_pixmap(
                dpi=300
            )

            image = Image.frombytes(
                "RGB",
                [pix.width, pix.height],
                pix.samples
            )

            ocr_text = pytesseract.image_to_string(
                image
            )

            text += ocr_text + "\n"


    doc.close()

    return text.strip()