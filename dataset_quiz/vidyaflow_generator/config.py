"""Configuration settings and environment variable management for VidyaFlow Generator."""
import os
from pathlib import Path
from dotenv import load_dotenv

# Automatically load .env file if present
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BASE_DIR
DEFAULT_INPUT_DIR = BASE_DIR
DEFAULT_OUTPUT_DIR = BASE_DIR / "vidyaflow_generated_content"
DEFAULT_OUTPUT_ZIP = BASE_DIR / "vidyaflow_generated_content.zip"
CACHE_DIR = BASE_DIR / ".cache" / "vidyaflow"
EXTRACTED_CHAPTERS_DIR = BASE_DIR / "output" / "extracted_chapters"

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-1.5-pro")

# Rate limiting and retry settings
GEMINI_REQUEST_DELAY_SECONDS = float(os.getenv("GEMINI_REQUEST_DELAY_SECONDS", "1.0"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
RETRY_BACKOFF_BASE = float(os.getenv("RETRY_BACKOFF_BASE", "2.0"))

# Validation constants
EXACT_QUIZ_QUESTION_COUNT = 20
QUIZ_DIFFICULTY_DISTRIBUTION = {
    "easy": 7,
    "medium": 8,
    "hard": 5
}
MINDMAP_MAX_DEPTH = 3  # Maximum levels below root

# Supported boards and mediums
DEFAULT_BOARD = "Telangana State Board (SCERT)"
DEFAULT_LANGUAGE = "English"

# OCR settings
MIN_CHARS_PER_PAGE_THRESHOLD = 50
OCR_ENABLED = os.getenv("OCR_ENABLED", "true").lower() in ("true", "1", "yes")
