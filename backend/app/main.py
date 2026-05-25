from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.database import database
from app.routers import auth, overview, meta, adoption, usage, value, cost, errors, channels, health, growth


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()


app = FastAPI(title="AxonHub Metrics", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(overview.router, prefix="/api/overview", tags=["overview"])
app.include_router(adoption.router, prefix="/api/adoption", tags=["adoption"])
app.include_router(usage.router, prefix="/api/usage", tags=["usage"])
app.include_router(value.router, prefix="/api/value", tags=["value"])
app.include_router(cost.router, prefix="/api/cost", tags=["cost"])
app.include_router(meta.router, prefix="/api/meta", tags=["meta"])
app.include_router(errors.router, prefix="/api/errors", tags=["errors"])
app.include_router(channels.router, prefix="/api/channels", tags=["channels"])
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(growth.router, prefix="/api/growth", tags=["growth"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


# Serve built frontend and handle SPA routing
STATIC_DIR = Path(__file__).parent.parent / "static"
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

    @app.exception_handler(404)
    async def spa_fallback(request, exc):
        """Redirect all non-API 404s to index.html for SPA routing."""
        if request.url.path.startswith("/api/") or request.url.path.startswith("/docs") or request.url.path == "/openapi.json":
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        index = STATIC_DIR / "index.html"
        if index.exists():
            return FileResponse(str(index))
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
