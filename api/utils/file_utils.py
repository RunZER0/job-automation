import io
import os
from fastapi import UploadFile
from typing import Union

def extract_text_from_file(file: UploadFile) -> str:
    filename = file.filename.lower()

    # Handle PDF files
    if filename.endswith('.pdf'):
        try:
            from pdfminer.high_level import extract_text
            import tempfile
            # Save the uploaded PDF to a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(file.file.read())
                tmp_path = tmp.name
            text = extract_text(tmp_path)
            os.unlink(tmp_path)
            return text
        except Exception as e:
            print(f"PDF extraction failed: {e}")
            return ""

    # Handle DOCX files
    elif filename.endswith('.docx'):
        try:
            from docx import Document
            import tempfile
            # Save the uploaded DOCX to a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
                tmp.write(file.file.read())
                tmp_path = tmp.name
            doc = Document(tmp_path)
            text = "\n".join([para.text for para in doc.paragraphs])
            os.unlink(tmp_path)
            return text
        except Exception as e:
            print(f"DOCX extraction failed: {e}")
            return ""

    # Handle TXT files
    elif filename.endswith('.txt'):
        content = file.file.read()
        try:
            return content.decode('utf-8')
        except Exception:
            return content.decode('latin-1', errors='ignore')

    # Fallback for unknown file types
    else:
        return "Unsupported file type. Please upload PDF, DOCX, or TXT."

