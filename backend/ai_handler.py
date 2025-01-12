import openai
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Retrieve the OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

def get_recommendations(windows, doors, city):
    prompt = f"Suggest security tips for a home with {windows} windows and {doors} doors in {city}."
    response = client.chat.completions.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=100
    )
    return response.choices[0].text.strip()
