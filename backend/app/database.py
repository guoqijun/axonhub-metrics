from databases import Database
from app.config import get_settings

database = Database(get_settings().database_url)


async def get_db() -> Database:
    return database
