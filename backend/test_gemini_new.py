from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key: {api_key[:15]}..." if api_key else "No key!")

client = genai.Client(api_key=api_key)

# Use AVAILABLE models from your list
models_to_try = [
    'gemini-2.5-flash',           # Newest
    'gemini-2.0-flash-lite',      # Lighter quota usage
    'gemini-2.5-flash-lite',      # Even lighter
    'gemini-flash-lite-latest',   # Latest lite version
]

print("\n🔄 Testing models...")

for model_name in models_to_try:
    try:
        print(f"\n  Testing {model_name}...")
        response = client.models.generate_content(
            model=model_name,
            contents="Say 'Hello' in Hindi"
        )
        print(f"  ✅ SUCCESS with {model_name}!")
        print(f"  Response: {response.text}")
        break
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            print(f"  ⚠️ {model_name}: Quota exhausted, trying next...")
        elif "404" in error_msg:
            print(f"  ❌ {model_name}: Not found")
        else:
            print(f"  ❌ {model_name}: {error_msg[:60]}")