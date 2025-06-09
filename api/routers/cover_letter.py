from fastapi import APIRouter, UploadFile, File, Form
from api.utils.file_utils import extract_text_from_file
import openai
import os
import re
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

def strip_markdown(text):
    # Remove common markdown/asterisk formatting if it sneaks in
    text = re.sub(r'^\s*[\*\-]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'^\s*-{2,}\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[([^\]]+)\]', r'\1', text)
    text = re.sub(r'\n{2,}', '\n\n', text)
    text = text.replace('\u200b', '')
    return text.strip()

@router.post("/generate")
async def generate_cover_letter(
    cv_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # 1. Extract raw text from the uploaded CV file
    cv_text = extract_text_from_file(cv_file)

    # 2. Step 1: Use the LLM to parse the CV into contact info and key sections
    openai.api_key = os.getenv("OPENAI_API_KEY")
    parsing_prompt = (
        "You are an expert in extracting structured information from resumes for job applications. "
        "Given the resume text below, extract ONLY the following if present (do not invent or add any info, do not use placeholders):\n"
        "- Name\n"
        "- Address/City\n"
        "- Email\n"
        "- Phone\n"
        "- LinkedIn\n"
        "- Relevant Education/Qualifications\n"
        "- Relevant Experience\n"
        "- Relevant Skills\n"
        "- Achievements (if present)\n"
        "If any section is missing, just omit it in the output. Output only plain text, labeled with headers, no markdown, no asterisks.\n\n"
        f"Resume text:\n{cv_text}"
    )
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert at extracting contact and professional info from resumes."},
            {"role": "user", "content": parsing_prompt}
        ],
        max_tokens=1000
    )
    parsed_cv = response.choices[0].message.content.strip()
    parsed_cv = strip_markdown(parsed_cv)

    # 3. Step 2: Use the LLM to compose the cover letter with professional header using only extracted info
    cover_letter_prompt = (
        "You are an expert career coach and cover letter writer.\n"
        "Write a persuasive, concise, and highly relevant cover letter for the job below, using only the candidate's real details and experience from the extracted CV info. "
        "Start the letter with a professional header containing only the available details (name, address, phone, email, LinkedIn, etc.), and the company's name/address if it can be found in the job description. "
        "Do NOT fabricate or invent any information—use only details from the provided extracted CV info and job description. "
        "If any info is missing, leave it blank or omit that line.\n\n"
        "Extracted CV Info:\n"
        f"{parsed_cv}\n\n"
        "Job Description:\n"
        f"{job_description}"
    )

    cover_letter_response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert in cover letter writing for job applications."},
            {"role": "user", "content": cover_letter_prompt}
        ],
        max_tokens=900
    )
    cover_letter = cover_letter_response.choices[0].message.content
    cover_letter = strip_markdown(cover_letter)

    return {"cover_letter": cover_letter}
