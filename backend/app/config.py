"""ClinicQ backend settings - reads DATABASE_URL from the environment."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "ClinicQ"
    database_url: str = "postgresql+psycopg://clinicq:clinicq@localhost:5432/clinicq"
    seed_on_startup: bool = True


settings = Settings()
