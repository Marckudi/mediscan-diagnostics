from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MediScan Diagnostics API"
    app_version: str = "1.0.0"
    debug: bool = False

    anthropic_api_key: str
    claude_model: str = "claude-sonnet-4-6"
    max_tokens: int = 4096

    api_key_enabled: bool = False
    api_key: str = ""

    max_image_size_mb: int = 10
    allowed_image_types: list[str] = ["image/jpeg", "image/png", "image/webp", "image/gif"]

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
