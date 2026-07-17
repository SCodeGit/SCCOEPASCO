import os


def scan_pdfs(folder):

    pdf_files = []


    for root, dirs, files in os.walk(folder):

        for file in files:

            if file.lower().endswith(".pdf"):

                path = os.path.join(
                    root,
                    file
                )

                pdf_files.append(path)


    return pdf_files
