from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./moneyflow.db"
    jwt_secret: str = "development-only-change-me"
    access_token_minutes: int = 60
    environment: str = "development"
    seed_demo_data: bool = False
    cors_origins: str = "http://localhost:3000"

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")


settings = Settings()
