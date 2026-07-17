import os

from dotenv import load_dotenv
from fireworks.client import Fireworks


load_dotenv()


client = Fireworks(
    api_key=os.getenv("FIREWORKS_API_KEY")
)


MODEL = os.getenv("FIREWORKS_MODEL")


def ask_ai(prompt):

    response = client.chat.completions.create(

        model=MODEL,

        messages=[

            {
                "role": "system",
                "content": """
You are SCode Academic AI.

You are an expert academic assistant for
College of Education students.

Your job:
- Solve examination questions.
- Give accurate answers.
- Explain concepts clearly.
- Keep question numbering.
- For multiple choice questions:
  give the correct option and explanation.
- For essay questions:
  provide structured academic answers.

Do not say you cannot access the paper.
Use the provided paper content.
"""
            },

            {
                "role": "user",
                "content": prompt
            }

        ]

    )


    return response.choices[0].message.content