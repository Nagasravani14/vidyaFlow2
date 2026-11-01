import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    GEMINI_API_KEY: Optional[str] = None
    VidyaFlow: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash"
    APP_NAME: str = "VidyaFlow"
    DATABASE_URL: str = f"sqlite:///{BACKEND_DIR / 'vidyaflow.db'}"

    @property
    def api_key(self) -> Optional[str]:
        """Centralized accessor for the configured Gemini API key."""
        return self.GEMINI_API_KEY or self.VidyaFlow or os.getenv("GEMINI_API_KEY") or os.getenv("VidyaFlow")


settings = Settings()
