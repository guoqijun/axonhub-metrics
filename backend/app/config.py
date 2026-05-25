from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "mysql+aiomysql://root@localhost/axonhub"
    secret_key: str = "axonhub-metrics-secret"
    admin_username: str = "admin"
    access_token_expire_hours: int = 24

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
