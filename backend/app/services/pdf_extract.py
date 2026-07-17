import fitz
import requests


def extract_pdf_text(url):

    response = requests.get(url)

    response.raise_for_status()

    pdf_data = response.content

    doc = fitz.open(
        stream=pdf_data,
        filetype="pdf"
    )

    text = ""

    for page in doc:
        text += page.get_text()

    doc.close()

    return text