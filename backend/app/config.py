from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./moneyflow.db"
    jwt_secret: str = "development-only-change-me"
    access_token_minutes: int = 60
    environment: str = "development"
    seed_demo_data: bool = False

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")


settings = Settings()
