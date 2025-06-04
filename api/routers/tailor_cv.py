from fastapi import APIRouter, UploadFile, File, Form
from api.utils.file_utils import extract_text_from_file
import openai
import os
import re
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env

router = APIRouter()

def strip_markdown(text):
    # Remove markdown bold, italic, headings, horizontal rules, and brackets
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # bold
    text = re.sub(r'\*([^*]+)\*', r'\1', text)      # italic
    text = re.sub(r'^\s*-{2,}\s*$', '', text, flags=re.MULTILINE)  # horizontal rules like --- or ----
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)         # headings #
    text = re.sub(r'\[([^\]]+)\]', r'\1', text)                    # [placeholders]
    text = re.sub(r'\n{2,}', '\n\n', text)                         # normalize blank lines
    text = text.replace('\u200b', '')                              # zero-width space
    return text.strip()

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
        "Be honest—do not make up or fabricate experiences, education, or skills. Only rephrase and reorder content for optimal fit. "
        "Do NOT use placeholders (like [Your Name]), do NOT use markdown, bold, stars, or horizontal lines—output plain text only. "
        "If information is missing in the CV, simply omit it, do not invent or insert a bracketed placeholder.\n\n"
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
    tailored_cv = strip_markdown(tailored_cv)
    return {"tailored_cv": tailored_cv}
