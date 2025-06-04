from fastapi import APIRouter, UploadFile, File, Form
from api.utils.file_utils import extract_text_from_file
import openai
import os
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env

router = APIRouter()

@router.post("/tailor")
async def tailor_cv(
    cv_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    cv_text = extract_text_from_file(cv_file)
    openai.api_key = os.getenv("OPENAI_API_KEY")

    prompt = (
        "You are an expert career coach and resume writer. "
        "Rewrite the following CV to best match the job description provided. "
        "Highlight relevant skills, experiences, and achievements that are most important for the role. "
        "Be honest—do not make up experiences. Only rephrase and reorder content for optimal fit.\n\n"
        f"CV:\n{cv_text}\n\nJob Description:\n{job_description}"
    )

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert in resume tailoring."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1500
    )
    tailored_cv = response.choices[0].message.content
    return {"tailored_cv": tailored_cv}
