from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import tailor_cv, cover_letter

app = FastAPI(
    title="Job Automation API",
    description="API for tailoring CVs and generating cover letters",
    version="1.0.0"
)

# Add CORS **after** app is defined
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tailor_cv.router, prefix="/cv", tags=["CV"])
app.include_router(cover_letter.router, prefix="/cover-letter", tags=["Cover Letter"])
