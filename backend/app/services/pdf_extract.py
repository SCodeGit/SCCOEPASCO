import fitz
import requests
import tempfile


def extract_pdf_text(url):

    response = requests.get(url)

    response.raise_for_status()

    with tempfile.NamedTemporaryFile(suffix=".pdf") as file:
        file.write(response.content)
        file.flush()

        doc = fitz.open(file.name)

        text = ""

        for page in doc:
            text += page.get_text()

        return text