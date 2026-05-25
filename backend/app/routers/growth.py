from fastapi import APIRouter, Depends
from databases import Database

from app.database import get_db
from app.services.base import FilterParams
from app.services.growth import GrowthService

router = APIRouter()


def _get_service(db: Database = Depends(get_db)) -> GrowthService:
    return GrowthService(db)


@router.get("/mom_yoy")
async def get_mom_yoy(params: FilterParams = Depends(), service: GrowthService = Depends(_get_service)):
    return await service.get_mom_yoy(params)


@router.get("/forecast")
async def get_forecast(params: FilterParams = Depends(), service: GrowthService = Depends(_get_service)):
    return await service.get_forecast(params)


@router.get("/user_growth_curve")
async def get_user_growth_curve(params: FilterParams = Depends(), service: GrowthService = Depends(_get_service)):
    return await service.get_user_growth_curve(params)


@router.get("/model_growth_rate")
async def get_model_growth_rate(params: FilterParams = Depends(), service: GrowthService = Depends(_get_service)):
    return await service.get_model_growth_rate(params)


@router.get("/channel_market_share")
async def get_channel_market_share(params: FilterParams = Depends(), service: GrowthService = Depends(_get_service)):
    return await service.get_channel_market_share(params)


@router.get("/project_growth_ranking")
async def get_project_growth_ranking(params: FilterParams = Depends(), service: GrowthService = Depends(_get_service)):
    return await service.get_project_growth_ranking(params)
