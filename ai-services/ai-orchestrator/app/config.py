from functools import lru_cache
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    product_service_url: str = "http://localhost:8081"
    ai_database_url: SecretStr = Field(default=SecretStr("postgresql://localhost/shopai_ai"))
    redis_url: SecretStr = Field(default=SecretStr("redis://localhost:6379/1"))
    cors_origins: str = "http://localhost:5173"
    openai_api_key: SecretStr = Field(default=SecretStr(""))
    openai_model: str = "gpt-4o-mini"

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
