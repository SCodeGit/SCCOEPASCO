import os
import sys


sys.path.append(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


from app.services.pdf_extract import extract_pdf_text
from app.services.mongo import save_paper



ROOT = os.path.join(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )
    ),
    "university of Ghana(UG)"
)



def get_metadata(path):

    parts = path.split(os.sep)

    metadata = {}

    metadata["university"] = "university of Ghana(UG)"

    metadata["level"] = next(
        (
            x for x in parts
        ),
        ""
    )


    metadata["semester"] = next(
        (
            x for x in parts

            if "sem" in x.lower()
        ),
        ""

    )

    return metadata





for root, dirs, files in os.walk(ROOT):

    for file in files:

        if not file.lower().endswith(".pdf"):
            continue


        pdf_path = os.path.join(
            root,
            file
        )


        print("\n====================")
        print("PROCESSING:", pdf_path)


        try:

            text = extract_pdf_text(
                pdf_path
            )


            metadata = get_metadata(
                pdf_path
            )


            metadata["filename"] = file

            metadata["path"] = pdf_path

            metadata["text_length"] = len(text)

            metadata["processed"] = True

            metadata["ocr_used"] = True



            if len(text.strip()) == 0:

                metadata["processed"] = False

                print("WARNING: EMPTY OCR")



            save_paper(
                file,
                pdf_path,
                text,
                metadata
            )


            print(
                "SAVED TO MONGO:",
                len(text),
                "characters"
            )



        except Exception as e:

            print(
                "FAILED:",
                pdf_path
            )

            print(e)
