from fastapi import APIRouter, Depends
from databases import Database

from app.database import get_db
from app.services.base import FilterParams
from app.services.cost import CostService

router = APIRouter()


def _get_service(db: Database = Depends(get_db)) -> CostService:
    return CostService(db)


@router.get("/token_fee_trend")
async def get_token_fee_trend(params: FilterParams = Depends(), service: CostService = Depends(_get_service)):
    return await service.get_token_fee_trend(params)


@router.get("/model_distribution")
async def get_model_distribution(params: FilterParams = Depends(), service: CostService = Depends(_get_service)):
    return await service.get_model_distribution(params)


@router.get("/channel_comparison")
async def get_channel_comparison(params: FilterParams = Depends(), service: CostService = Depends(_get_service)):
    return await service.get_channel_comparison(params)


@router.get("/user_top")
async def get_user_top(params: FilterParams = Depends(), service: CostService = Depends(_get_service)):
    return await service.get_user_top(params)


@router.get("/project_daily_cost")
async def get_project_daily_cost(params: FilterParams = Depends(), service: CostService = Depends(_get_service)):
    return await service.get_project_daily_cost(params)


@router.get("/cache_hit_rate")
async def get_cache_hit_rate(params: FilterParams = Depends(), service: CostService = Depends(_get_service)):
    return await service.get_cache_hit_rate(params)


@router.get("/reasoning_ratio")
async def get_reasoning_ratio(params: FilterParams = Depends(), service: CostService = Depends(_get_service)):
    return await service.get_reasoning_ratio(params)


@router.get("/forecast")
async def get_forecast(params: FilterParams = Depends(), service: CostService = Depends(_get_service)):
    return await service.get_forecast(params)
