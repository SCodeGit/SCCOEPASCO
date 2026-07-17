import fitz
import pytesseract

from PIL import Image


def extract_pdf_text(file_path):

    doc = fitz.open(file_path)

    text = ""

    # ---------------------------------
    # Try extracting embedded PDF text
    # ---------------------------------

    for page in doc:

        page_text = page.get_text()

        text += page_text + "\n"


    # ---------------------------------
    # OCR fallback for scanned PDFs
    # ---------------------------------

    if len(text.strip()) < 100:

        print("OCR MODE:", file_path)

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
    # Clean OCR noise
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


    return text.strip()