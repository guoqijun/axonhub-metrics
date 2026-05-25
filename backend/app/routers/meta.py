from fastapi import APIRouter, Depends
from databases import Database

from app.database import get_db

router = APIRouter()


@router.get("/users")
async def get_users(db: Database = Depends(get_db)):
    rows = await db.fetch_all("""
        SELECT DISTINCT user_id
        FROM api_keys
        WHERE user_id IS NOT NULL
        ORDER BY user_id
    """)
    return [{"id": r["user_id"]} for r in rows]


@router.get("/channels")
async def get_channels(db: Database = Depends(get_db)):
    rows = await db.fetch_all("""
        SELECT id, name FROM channels ORDER BY id
    """)
    return [{"id": r["id"], "name": r["name"]} for r in rows]


@router.get("/models")
async def get_models(db: Database = Depends(get_db)):
    rows = await db.fetch_all("""
        SELECT DISTINCT model_id as id
        FROM usage_logs
        ORDER BY model_id
    """)
    return [{"id": r["id"]} for r in rows]


@router.get("/projects")
async def get_projects(db: Database = Depends(get_db)):
    rows = await db.fetch_all("""
        SELECT id, name FROM projects ORDER BY id
    """)
    return [{"id": r["id"], "name": r["name"]} for r in rows]
