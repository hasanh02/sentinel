import openai
from config import OPENAI_API_KEY

# Set the OpenAI API key
openai.api_key = OPENAI_API_KEY

def get_recommendations(windows, doors, city):
    prompt = f"Suggest security tips for a home with {windows} windows and {doors} doors in {city}."
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=100
    )
    return response.choices[0].text.strip()
