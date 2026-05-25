from fastapi import APIRouter, Depends
from databases import Database

from app.database import get_db

router = APIRouter()


@router.get("/users")
async def get_users(db: Database = Depends(get_db)):
    rows = await db.fetch_all("""
        SELECT DISTINCT ak.employee_id,
               ak.employee_name,
               ak.employee_org_id, ak.employee_org_name
        FROM api_keys ak
        WHERE ak.employee_id IS NOT NULL
        ORDER BY ak.employee_id
    """)
    return [
        {
            "id": r["employee_id"],
            "employee_id": r["employee_id"],
            "employee_name": r["employee_name"],
            "employee_org_id": r["employee_org_id"],
            "employee_org_name": r["employee_org_name"],
        }
        for r in rows
    ]


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
