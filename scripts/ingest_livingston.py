import os
import io
import json
import requests
from bs4 import BeautifulSoup
import pypdf
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
HEADERS = {"User-Agent": "Mozilla/5.0"}

def get_livingston_text():
    extracted_text = ""
    try:
        res = requests.get("https://www.livingstonlegalnotices.org/", headers=HEADERS, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        for notice in soup.find_all(["div", "p", "article"], limit=15):
            text = notice.get_text().strip()
            if len(text) > 40:
                extracted_text += text + "\n---\n"
    except Exception as e:
        print(f"Notice fetch error: {e}")

    if len(extracted_text) < 200:
        try:
            res = requests.get("https://www.livingstonnj.org/AgendaCenter", headers=HEADERS, timeout=10)
            soup = BeautifulSoup(res.text, "html.parser")
            for link in soup.find_all("a", href=True):
                if "ViewFile" in link['href'] or "DocumentCenter" in link['href']:
                    pdf_url = link['href'] if link['href'].startswith("http") else "https://www.livingstonnj.org" + link['href']
                    pdf_res = requests.get(pdf_url, headers=HEADERS, timeout=15)
                    reader = pypdf.PdfReader(io.BytesIO(pdf_res.content))
                    for page in reader.pages[:8]:
                        extracted_text += page.extract_text() or ""
                    break
        except Exception as e:
            print(f"PDF fetch error: {e}")

    return extracted_text[:12000]

document_content = get_livingston_text()

prompt = f"""
You are a civic media editor for Livingston, NJ. Convert these official township documents into 3 engaging Instagram-style social posts.
Text: {document_content}

Respond ONLY in valid JSON matching this exact structure:
[
  {{
    "id": "liv-101",
    "username": "livingston_pulse",
    "userAvatar": "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150",
    "timeAgo": "2h ago",
    "category": "TOWN UPDATE",
    "caption": "Short catchy summary of how this impacts Livingston residents #LivingstonNJ",
    "imageUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800",
    "likes": 312,
    "comments": 42,
    "shares": 18,
    "consensusPercent": 86,
    "trendingBadge": "🔥 Trending in Livingston",
    "quickVoteQuestion": "Community poll question?",
    "quickVoteOptionA": "Support",
    "quickVoteOptionB": "Oppose",
    "quickVotePercentA": 78
  }}
]
"""

model = genai.GenerativeModel("gemini-2.5-flash")
response = model.generate_content(prompt)
clean_json = response.text.replace("```json", "").replace("```", "").strip()

os.makedirs("public", exist_ok=True)
with open("public/livingston_feed.json", "w") as f:
    f.write(clean_json)
