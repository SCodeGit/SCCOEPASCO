import os
import json
from dotenv import load_dotenv
from fireworks.client import Fireworks

load_dotenv()

client = Fireworks(
    api_key=os.getenv("FIREWORKS_API_KEY")
)

MODEL = os.getenv("FIREWORKS_MODEL")

def ask_ai(prompt):
    # Enforce structured JSON JSON response format via system instructions
    system_instruction = """
You are SCode Academic AI, a structured exam parsing engine.

Your task is to analyze the provided examination paper content and extract the questions into a valid, parsable JSON array. Do not include any conversational filler, intro text, or markdown blocks outside the JSON structure.

You must return a raw JSON array of objects matching this exact schema layout:
[
  {
    "id": "unique_question_id_string",
    "type": "objective" or "essay",
    "question": "The complete text of the question sentence or prompt",
    "options": {
      "A": "Text for option A if applicable",
      "B": "Text for option B if applicable",
      "C": "Text for option C if applicable",
      "D": "Text for option D if applicable"
    },
    "correct_answer": "The letter choice (e.g. A, B, C, D) or null for essay",
    "solution": "Detailed academic explanation core breaking down why the choice is correct or structural essay answer."
  }
]

Ensure all fields are fully populated based on the contents text. If options are present inline, extract them fully into the options map object.
"""

    response = client.chat.completions.create(
        model=MODEL,
        response_format={"type": "json_object"}, # Tells Fireworks to guarantee a valid JSON response string
        messages=[
            {
                "role": "system",
                "content": system_instruction
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content