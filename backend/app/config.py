from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./moneyflow.db"
    jwt_secret: str = "development-only-change-me"
    access_token_minutes: int = 60
    environment: str = "development"
    seed_demo_data: bool = False
    cors_origins: str = "http://localhost:3000"
    encryption_key: str = Field(default="", validation_alias="MONEYFLOW_ENCRYPTION_KEY")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def sqlalchemy_database_url(self) -> str:
        """Use the installed Psycopg 3 driver for generic Postgres URLs."""
        if self.database_url.startswith("postgres://"):
            return self.database_url.replace("postgres://", "postgresql+psycopg://", 1)
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        return self.database_url

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")


settings = Settings()
