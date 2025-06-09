from fastapi import APIRouter, UploadFile, File, Form
from api.utils.file_utils import extract_text_from_file
import openai
import os
import re
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env

router = APIRouter()

# --- Helpers to extract sections from plain text CV ---

def extract_section(text, header, next_headers):
    """
    Extracts section text between header and the next of any next_headers.
    """
    # Pattern to match section from 'header' to next header or end of text
    pattern = rf"{header}[\s:]*([\s\S]+?)(?=(?:^({'|'.join(next_headers)})[\s:]*$)|\Z)"
    match = re.search(pattern, text, re.MULTILINE | re.IGNORECASE)
    return match.group(1).strip() if match else ""

def extract_name(text):
    # Look for first non-empty, non-section line as name
    for line in text.splitlines():
        if line.strip() and "resume" not in line.lower() and "curriculum" not in line.lower():
            return line.strip()
    return ""

def extract_contact(text):
    # Grab all lines before "Professional Summary" or similar
    lines = text.splitlines()
    contact_lines = []
    for line in lines[1:10]:  # Usually found at the top, adjust if needed
        if re.search(r"professional summary|summary|objective", line, re.IGNORECASE):
            break
        if line.strip():
            contact_lines.append(line.strip())
    return ' | '.join(contact_lines)

def strip_markdown(text):
    text = re.sub(r'^\s*[\*\-]\s+', '', text, flags=re.MULTILINE)  # Remove bullet asterisks/hyphens
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # bold
    text = re.sub(r'\*([^*]+)\*', r'\1', text)      # italic
    text = re.sub(r'^\s*-{2,}\s*$', '', text, flags=re.MULTILINE)  # horizontal rules
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)         # headings
    text = re.sub(r'\[([^\]]+)\]', r'\1', text)                    # [placeholders]
    text = re.sub(r'\n{2,}', '\n\n', text)                         # blank lines
    text = text.replace('\u200b', '')                              # zero-width space
    return text.strip()

@router.post("/tailor")
async def tailor_cv(
    cv_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    cv_text = extract_text_from_file(cv_file)

    # --- Extract sections ---
    # Lowercased headers for searching
    section_headers = [
        "PROFESSIONAL SUMMARY", "SUMMARY", "OBJECTIVE", "CORE COMPETENCIES", "SKILLS",
        "EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EDUCATION", "PROJECTS", "CERTIFICATIONS", "ADDITIONAL", "RESEARCH"
    ]

    name = extract_name(cv_text)
    contact = extract_contact(cv_text)

    summary = extract_section(cv_text, r"(PROFESSIONAL SUMMARY|SUMMARY|OBJECTIVE)", section_headers)
    skills = extract_section(cv_text, r"(CORE COMPETENCIES|SKILLS)", section_headers)
    education = extract_section(cv_text, r"EDUCATION", section_headers)
    experience = extract_section(cv_text, r"(PROFESSIONAL EXPERIENCE|EXPERIENCE)", section_headers)

    # --- LLM prompt for tailoring only summary & experience ---
    openai.api_key = os.getenv("OPENAI_API_KEY")

    prompt = (
        f"You are an expert career coach and resume writer. "
        f"Rewrite the SUMMARY and EXPERIENCE sections below to best fit the job description. "
        f"Do NOT invent information—use only details present. "
        f"Do NOT use markdown, asterisks, or fancy formatting; output plain text. "
        f"Keep the overall tone professional and targeted for the specific job.\n\n"
        f"SUMMARY:\n{summary}\n\n"
        f"EXPERIENCE:\n{experience}\n\n"
        f"Job Description:\n{job_description}"
    )

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert in resume tailoring."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1500
    )
    tailored = response.choices[0].message.content.strip()
    tailored = strip_markdown(tailored)

    # --- Build the final tailored CV ---
    final_cv = (
        f"{name}\n"
        f"{contact}\n\n"
        f"Skills:\n{skills}\n\n"
        f"Education:\n{education}\n\n"
        f"{tailored}\n"
    )
    final_cv = strip_markdown(final_cv)

    return {"tailored_cv": final_cv}
