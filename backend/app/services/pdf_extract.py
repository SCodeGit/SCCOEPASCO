import fitz
import pytesseract
import requests

from PIL import Image
from io import BytesIO



def extract_pdf_text(pdf_url):

    print("DOWNLOADING PDF:")
    print(pdf_url)


    response = requests.get(pdf_url)


    if response.status_code != 200:
        raise Exception(
            "PDF download failed"
        )


    pdf_bytes = BytesIO(
        response.content
    )


    doc = fitz.open(
        stream=pdf_bytes,
        filetype="pdf"
    )


    text = ""


    # normal PDF extraction

    for page in doc:

        text += page.get_text() + "\n"



    # OCR fallback

    if len(text.strip()) < 100:

        print("OCR MODE")


        text=""


        for page_number,page in enumerate(doc):

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


    text = text.replace(
        "\x00",
        ""
    )


    text="\n".join(
        line.strip()
        for line in text.splitlines()
        if line.strip()
    )


    return text.strip()