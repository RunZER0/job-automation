from fastapi import APIRouter, UploadFile, File, Form
from api.utils.file_utils import extract_text_from_file
import openai
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

router = APIRouter()

@router.post("/generate")
async def generate_cover_letter(
    cv_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Extract text from uploaded CV file
    cv_text = extract_text_from_file(cv_file)

    # === DEBUG PRINTS HERE ===
    print("\n=== DEBUG INFO ===")
    print("CV length (chars):", len(cv_text))
    print("Job description length (chars):", len(job_description))
    print("CV preview:", repr(cv_text[:500]))
    print("Job description preview:", repr(job_description[:500]))
    print("==================\n")
    # === END DEBUG PRINTS ===

    # Set OpenAI API key from environment
    openai.api_key = os.getenv("OPENAI_API_KEY")

    # Compose the prompt
    prompt = (
        "You are an expert career coach and cover letter writer. "
        "Based on the CV and job description below, write a persuasive, concise, and highly relevant cover letter for this job. "
        "Keep it professional, avoid generic filler, and focus on how the candidate's experience aligns with the role. "
        "Do not fabricate any information—use only what is given.\n\n"
        f"CV:\n{cv_text}\n\nJob Description:\n{job_description}"
    )

    # Call OpenAI
    response = openai.chat.completions.create(
        model="gpt-4o",  # You may use "gpt-3.5-turbo" for faster/cheaper responses if desired
        messages=[
            {"role": "system", "content": "You are an expert in cover letter writing."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=800
    )

    cover_letter = response.choices[0].message.content
    return {"cover_letter": cover_letter}
