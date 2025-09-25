import os
import json
import boto3
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# --- INITIAL SETUP ---
load_dotenv()
app = FastAPI()

# --- CORS MIDDLEWARE ---
# This allows your Vercel frontend to talk to your Render backend
origins = [
    "http://localhost:3000",
    # Add your Vercel frontend URL here once deployed
    # e.g., "https://polyfox.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for simplicity, can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC MODELS ---
class UserProfile(BaseModel):
    age: int
    income: int
    goals: str
    current_investments: str

# --- DATA LAYER SERVICES ---

def get_real_time_market_news(api_key: str):
    """
    Fetches real-time financial news from an external API.
    This example uses a placeholder. Replace with a real API provider.
    """
    # TODO: Replace with a real API call from a provider like Alpha Vantage, NewsAPI, etc.
    # Example URL structure:
    # url = f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&apikey={api_key}"
    # try:
    #     response = requests.get(url)
    #     response.raise_for_status()
    #     data = response.json()
    #     # Process the data to extract top 3 headlines
    #     headlines = [item['title'] for item in data.get('feed', [])[:3]]
    #     return ", ".join(headlines)
    # except requests.exceptions.RequestException as e:
    #     print(f"Error fetching news: {e}")
    #     return "Could not fetch real-time news."
    
    # Returning mock data for demonstration purposes
    return "Market sentiment is cautiously optimistic due to stable inflation reports. Tech sector shows strong growth, while energy sector faces volatility."

def get_insight_from_amazon_nova(profile: UserProfile, market_news: str):
    """
    Constructs a prompt and gets a financial insight from Amazon Nova via Bedrock.
    """
    bedrock_client = boto3.client(
        service_name="bedrock-runtime",
        region_name=os.getenv("AWS_REGION_NAME"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )

    # TODO: Specify the exact Amazon Nova model ID you want to use
    # e.g., 'amazon.nova-pro', 'amazon.nova-lite'
    model_id = "amazon.titan-text-express-v1" # Using Titan as a placeholder for Nova

    prompt = f"""
    You are a financial advisor for the Indian market.
    Analyze the following client profile and the current market context to provide a personalized financial insight.
    The response should be a JSON object with three keys: "opportunity", "risk_assessment", and "suggested_action".

    Client Profile:
    - Age: {profile.age}
    - Annual Income: {profile.income} INR
    - Financial Goals: "{profile.goals}"
    - Current Investments: "{profile.current_investments}"

    Current Market Context:
    - {market_news}

    Based on all this information, generate the JSON response.
    """

    body = json.dumps({
        "inputText": prompt,
        "textGenerationConfig": {
            "maxTokenCount": 512,
            "temperature": 0.7,
            "topP": 0.9,
        }
    })

    try:
        response = bedrock_client.invoke_model(
            body=body,
            modelId=model_id,
            accept='application/json',
            contentType='application/json'
        )
        response_body = json.loads(response.get('body').read())
        # The actual output structure may vary by model. Adjust this line as needed.
        insight_text = response_body.get('results')[0].get('outputText')
        
        # Safely parse the JSON string from the AI's response
        return json.loads(insight_text.strip())

    except Exception as e:
        print(f"Error invoking AWS Nova model: {e}")
        # Return a fallback mock insight on error
        return {
            "opportunity": "Error connecting to AI model. Please check backend logs.",
            "risk_assessment": "Could not generate a risk assessment at this time.",
            "suggested_action": "Verify your AWS credentials and Bedrock model access in the backend."
        }


# --- API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "ok", "message": "PolyFox AI Financial Advisor backend is running."}


@app.post("/api/analyze")
def analyze_profile(profile: UserProfile):
    """
    This is the main endpoint that orchestrates the data retrieval and AI analysis.
    """
    print(f"Received profile for analysis: {profile.dict()}")

    financial_api_key = os.getenv("FINANCIAL_DATA_API_KEY")
    if not financial_api_key:
        raise HTTPException(status_code=500, detail="Financial API key is not configured.")

    # 1. Get real-time data
    market_news = get_real_time_market_news(financial_api_key)

    # 2. Get AI insight
    ai_insight = get_insight_from_amazon_nova(profile, market_news)

    # 3. Combine and return
    full_response = {
        "summary": f"Analysis for a {profile.age}-year-old with a goal of '{profile.goals}'",
        **ai_insight # Unpacks the dictionary from the AI
    }
    
    # TODO: Save the generated insight to your database here.

    return {"status": "success", "insight": full_response}
