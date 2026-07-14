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
                "role":"system",
                "content":"You are SCode Academic AI. Help students with academic questions."
            },
            {
                "role":"user",
                "content":prompt
            }
        ]
    )

    return response.choices[0].message.content
