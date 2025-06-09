from fastapi import APIRouter, UploadFile, File, Form
from api.utils.file_utils import extract_text_from_file
import openai
import os
import re
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

def strip_markdown(text):
    text = re.sub(r'^\s*[\*\-]\s+', '', text, flags=re.MULTILINE)  # Remove bullet asterisks/hyphens
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # bold
    text = re.sub(r'\*([^*]+)\*', r'\1', text)      # italic
    text = re.sub(r'^\s*-{2,}\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[([^\]]+)\]', r'\1', text)
    text = re.sub(r'\n{2,}', '\n\n', text)
    text = text.replace('\u200b', '')
    return text.strip()

def parse_cv_with_llm(cv_text):
    openai.api_key = os.getenv("OPENAI_API_KEY")

    parsing_prompt = (
        "You are an expert in analyzing and organizing CVs. "
        "Extract and organize the following resume text into these sections (use only what is present, do NOT invent or add any information, do NOT use placeholders):\n"
        "1. Name\n"
        "2. Contact Information\n"
        "3. Objective or Summary (if present)\n"
        "4. Education\n"
        "5. Skills\n"
        "6. Experience\n"
        "7. Projects (if present)\n"
        "8. Achievements (if present)\n"
        "9. References (if present)\n\n"
        "If a section is missing, simply omit it in the output. "
        "Output only plain text, with each section clearly labeled (do not use markdown, asterisks, or special formatting)."
        "\n\nResume text:\n"
        f"{cv_text}"
    )

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert in CV structure extraction."},
            {"role": "user", "content": parsing_prompt}
        ],
        max_tokens=1800
    )
    parsed_cv = response.choices[0].message.content.strip()
    return strip_markdown(parsed_cv)

def tailor_cv_with_llm(parsed_cv, job_description):
    openai.api_key = os.getenv("OPENAI_API_KEY")

    tailoring_prompt = (
        "You are an expert career coach and resume writer. "
        "Rewrite ONLY the content in each section below to best fit the job description, by reordering or rephrasing to highlight relevant skills, experience, and achievements. "
        "Do NOT add, invent, or fabricate any information, details, or placeholders. "
        "Do NOT use markdown, bold, asterisks, or special formatting; output plain text only. "
        "If a section is not relevant or is empty, you may omit it. "
        "Retain and clearly label the original sections. "
        "The sections to tailor are below.\n\n"
        f"{parsed_cv}\n\n"
        "Job Description:\n"
        f"{job_description}\n"
    )

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert in tailoring CVs honestly for specific job applications."},
            {"role": "user", "content": tailoring_prompt}
        ],
        max_tokens=1800
    )
    tailored_cv = response.choices[0].message.content.strip()
    return strip_markdown(tailored_cv)

@router.post("/tailor")
async def tailor_cv(
    cv_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Step 1: Extract text from uploaded PDF CV
    cv_text = extract_text_from_file(cv_file)

    # Step 2: Parse the CV into sections using the LLM
    parsed_cv = parse_cv_with_llm(cv_text)

    # Step 3: Tailor the parsed CV to the job description using the LLM
    tailored_cv = tailor_cv_with_llm(parsed_cv, job_description)

    # Step 4: Return the final, clean, plain-text tailored CV
    return {"tailored_cv": tailored_cv}
