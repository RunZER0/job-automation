from fastapi import APIRouter, UploadFile, File, Form
from api.utils.file_utils import extract_text_from_file
import openai
import os
import re
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

router = APIRouter()

def extract_contact_info(cv_text):
    # Simple regex to find email, phone, LinkedIn, and address/city (crude)
    name = ""
    email = ""
    phone = ""
    linkedin = ""
    address = ""
    lines = cv_text.splitlines()
    # Assume name is first non-empty line
    for line in lines:
        if line.strip():
            name = line.strip()
            break
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', cv_text)
    phone_match = re.search(r'\+\d{1,3}\s?\d{3}[\s\-]?\d{3}[\s\-]?\d{3,}', cv_text)
    linkedin_match = re.search(r'(https?://)?(www\.)?linkedin\.com/in/\S+', cv_text)
    address_match = re.search(r'(?i)(address|nairobi|kenya|[A-Z][a-z]+,?\s*(Kenya)?)', cv_text)
    email = email_match.group(0) if email_match else ""
    phone = phone_match.group(0) if phone_match else ""
    linkedin = linkedin_match.group(0) if linkedin_match else ""
    address = address_match.group(0) if address_match else ""
    return name, address, email, phone, linkedin

def extract_job_company_and_location(job_description):
    # Crude extraction for company and location from job description
    # Could be made more robust!
    company = ""
    location = ""
    # Find company: look for first line or Company/Overview lines
    for line in job_description.splitlines():
        if "limited" in line.lower() or "bank" in line.lower() or "company" in line.lower():
            company = line.strip()
            break
    # Find location
    loc_match = re.search(r'(?i)(Nairobi|Thika|Mombasa|Kisumu|Kenya)', job_description)
    if loc_match:
        location = loc_match.group(0)
    return company, location

@router.post("/generate")
async def generate_cover_letter(
    cv_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Extract text from uploaded CV file
    cv_text = extract_text_from_file(cv_file)

    # === Extract contact and job info ===
    name, address, email, phone, linkedin = extract_contact_info(cv_text)
    company, job_location = extract_job_company_and_location(job_description)

    # === DEBUG PRINTS HERE ===
    print("\n=== DEBUG INFO ===")
    print("CV length (chars):", len(cv_text))
    print("Job description length (chars):", len(job_description))
    print("Extracted name:", name)
    print("Extracted address:", address)
    print("Extracted email:", email)
    print("Extracted phone:", phone)
    print("Extracted LinkedIn:", linkedin)
    print("Extracted company:", company)
    print("Extracted job_location:", job_location)
    print("CV preview:", repr(cv_text[:500]))
    print("Job description preview:", repr(job_description[:500]))
    print("==================\n")
    # === END DEBUG PRINTS ===

    # Build header for cover letter
    lines = []
    if name: lines.append(name)
    if address: lines.append(address)
    if email: lines.append(email)
    if phone: lines.append(phone)
    if linkedin: lines.append(linkedin)
    lines.append("")  # blank line before date and company
    lines.append("[Date]")
    lines.append("")
    # Company/address block
    if company: lines.append(f"Hiring Manager\n{company}")
    else: lines.append("Hiring Manager")
    if job_location: lines.append(job_location)
    lines.append("")

    header = "\n".join(lines)

    # Set OpenAI API key from environment
    openai.api_key = os.getenv("OPENAI_API_KEY")

    # Compose the prompt
    prompt = (
        "You are an expert career coach and cover letter writer.\n"
        "Write a persuasive, concise, and highly relevant cover letter for the job below, using only the candidate's real experience and contact details from their CV. "
        "Start the letter with a professional header containing the candidate's name, address, phone, email, and LinkedIn (if found in the CV), and the company's address block (if found in the job description). "
        "Do not fabricate or invent any information—use only details from the provided CV and job description. "
        "If some contact info is missing, leave it blank or omit that line.\n\n"
        f"CV:\n{cv_text}\n\nJob Description:\n{job_description}"
    )

    # Call OpenAI
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert in cover letter writing."},
            {"role": "user", "content": f"{header}\n\n{prompt}"}
        ],
        max_tokens=800
    )

    cover_letter = response.choices[0].message.content
    return {"cover_letter": cover_letter}
