from fastapi import APIRouter, Depends
from databases import Database

from app.database import get_db
from app.services.base import FilterParams
from app.services.overview import OverviewService

router = APIRouter()


def _get_service(db: Database = Depends(get_db)) -> OverviewService:
    return OverviewService(db)


@router.get("/kpi")
async def get_overview_kpi(params: FilterParams = Depends(), service: OverviewService = Depends(_get_service)):
    return await service.get_kpi(params)


@router.get("/requests_trend")
async def get_requests_trend(params: FilterParams = Depends(), service: OverviewService = Depends(_get_service)):
    return await service.get_requests_trend(params)


@router.get("/token_trend")
async def get_token_trend(params: FilterParams = Depends(), service: OverviewService = Depends(_get_service)):
    return await service.get_token_trend(params)


@router.get("/model_distribution")
async def get_model_distribution(params: FilterParams = Depends(), service: OverviewService = Depends(_get_service)):
    return await service.get_model_distribution(params)


@router.get("/error_trend")
async def get_error_trend(params: FilterParams = Depends(), service: OverviewService = Depends(_get_service)):
    return await service.get_error_trend(params)
