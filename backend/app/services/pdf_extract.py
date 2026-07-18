import fitz
import pytesseract
import requests

from PIL import Image
from io import BytesIO


def extract_pdf_text(pdf_url):

    print("DOWNLOADING PDF:")
    print(pdf_url)


    # ---------------------------------
    # Download PDF from GitHub
    # ---------------------------------

    response = requests.get(
        pdf_url,
        timeout=60
    )


    response.raise_for_status()


    pdf_bytes = response.content


    # Open PDF from memory

    doc = fitz.open(
        stream=pdf_bytes,
        filetype="pdf"
    )


    text = ""


    # ---------------------------------
    # Try normal PDF text extraction
    # ---------------------------------

    for page in doc:

        page_text = page.get_text()

        text += page_text + "\n"



    # ---------------------------------
    # OCR fallback
    # ---------------------------------

    if len(text.strip()) < 100:

        print("OCR MODE")


        text = ""


        for page_number, page in enumerate(doc):

            print(
                "OCR PAGE:",
                page_number + 1
            )


            pix = page.get_pixmap(
                dpi=300
            )


            image = Image.frombytes(
                "RGB",
                [
                    pix.width,
                    pix.height
                ],
                pix.samples
            )


            ocr_text = pytesseract.image_to_string(
                image,
                config="--psm 6"
            )


            text += ocr_text + "\n"



    doc.close()


    # ---------------------------------
    # Clean text
    # ---------------------------------

    text = text.replace(
        "\x00",
        ""
    )


    text = "\n".join(
        line.strip()
        for line in text.splitlines()
        if line.strip()
    )


    print(
        "EXTRACTED CHARACTERS:",
        len(text)
    )


    return text.strip()