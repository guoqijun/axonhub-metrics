from fastapi import APIRouter, Depends, HTTPException, status
from databases import Database

from app.database import get_db
from app.auth import hash_password, verify_password, create_token, get_current_user
from app.models.auth import LoginRequest, TokenResponse
from app.config import get_settings

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: Database = Depends(get_db)):
    settings_instance = get_settings()
    if body.username != settings_instance.admin_username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    row = await db.fetch_one(
        "SELECT password_hash FROM admin_users WHERE username = :username",
        {"username": body.username},
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_token(body.username)
    return TokenResponse(token=token, expire_hours=settings_instance.access_token_expire_hours)


@router.post("/init", response_model=TokenResponse)
async def init_admin(body: LoginRequest, db: Database = Depends(get_db)):
    settings_instance = get_settings()
    if body.username != settings_instance.admin_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username")

    existing = await db.fetch_one(
        "SELECT id FROM admin_users WHERE username = :username",
        {"username": body.username},
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin already initialized")

    hashed = hash_password(body.password)
    await db.execute(
        "INSERT INTO admin_users (username, password_hash) VALUES (:username, :password_hash)",
        {"username": body.username, "password_hash": hashed},
    )

    token = create_token(body.username)
    return TokenResponse(token=token, expire_hours=settings_instance.access_token_expire_hours)


@router.get("/me")
async def get_me(username: str = Depends(get_current_user)):
    return {"username": username}
