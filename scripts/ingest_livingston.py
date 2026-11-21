import os
import json
import requests
from bs4 import BeautifulSoup
from google import genai

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
HEADERS = {"User-Agent": "Mozilla/5.0"}

def get_livingston_notices():
    url = "https://www.livingstonlegalnotices.org/"
    res = requests.get(url, headers=HEADERS, timeout=15)
    soup = BeautifulSoup(res.text, "html.parser")
    
    # Extract actual notice titles and links rather than page navigation
    items = []
    for a in soup.find_all("a", href=True):
        title = a.get_text(strip=True)
        href = a["href"]
        if any(keyword in title.upper() for keyword in ["ORDINANCE", "NOTICE", "BUDGET", "HEARING", "BID"]):
            full_url = href if href.startswith("http") else f"https://www.livingstonlegalnotices.org{href}"
            items.append(f"Title: {title} | Link: {full_url}")
            
    # Print to GitHub Actions logs so you can audit the exact raw sources
    raw_feed = "\n".join(items[:15])
    print("=== RAW SCRAPED LIVINGSTON ITEMS ===")
    print(raw_feed)
    return raw_feed

document_content = get_livingston_notices()

prompt = f"""
You are a civic media editor for Livingston, NJ. 
Using ONLY the verified Livingston Township legal notices below, create 3 Instagram-style social posts.
CRITICAL RULE: You MUST cite the exact Ordinance number, Resolution, or Notice title and include its exact sourceUrl from the list below. Do not invent facts.

Verified Notices:
{document_content}

Respond ONLY in valid JSON matching this exact structure:
[
  {{
    "id": "liv-101",
    "username": "livingston_pulse",
    "userAvatar": "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150",
    "timeAgo": "Today",
    "category": "ORDINANCE | BUDGET | PLANNING",
    "officialRef": "Exact Ordinance # or Notice Title from source",
    "sourceUrl": "Exact URL from source",
    "caption": "Catchy plain-English breakdown citing the exact ordinance/project + #LivingstonNJ",
    "imageUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800",
    "likes": 284,
    "comments": 36,
    "shares": 19,
    "consensusPercent": 82,
    "trendingBadge": "🔥 Verified Town Record",
    "quickVoteQuestion": "Specific poll question about this exact ordinance?",
    "quickVoteOptionA": "Support",
    "quickVoteOptionB": "Oppose",
    "quickVotePercentA": 68
  }}
]
"""

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=prompt,
)
clean_json = response.text.replace("```json", "").replace("```", "").strip()

os.makedirs("public", exist_ok=True)
with open("public/livingston_feed.json", "w") as f:
    f.write(clean_json)
