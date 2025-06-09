from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api.routers import tailor_cv, cover_letter
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Job Automation API",
    description="API for tailoring CVs and generating cover letters with support for PDF, DOCX, and TXT files",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler for file processing errors
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP Exception: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )

# Global exception handler for unexpected errors
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500}
    )

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "message": "Job Automation API is running"}

# Root endpoint with API information
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Job Automation API",
        "version": "1.0.0",
        "supported_formats": ["PDF", "DOCX", "TXT"],
        "endpoints": {
            "cv_tailoring": "/cv/tailor",
            "cover_letter": "/cover-letter/generate",
            "health": "/health",
            "docs": "/docs"
        }
    }

# Include routers
app.include_router(tailor_cv.router, prefix="/cv", tags=["CV"])
app.include_router(cover_letter.router, prefix="/cover-letter", tags=["Cover Letter"])

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Job Automation API starting up...")
    logger.info("Supported file formats: PDF, DOCX, TXT")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Job Automation API shutting down...")