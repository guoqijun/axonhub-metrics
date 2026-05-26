from fastapi import APIRouter, Depends
from databases import Database

from app.database import get_db
from app.services.base import FilterParams
from app.services.adoption import AdoptionService

router = APIRouter()


def _get_service(db: Database = Depends(get_db)) -> AdoptionService:
    return AdoptionService(db)


@router.get("/dau_mau_trend")
async def get_dau_mau_trend(params: FilterParams = Depends(), service: AdoptionService = Depends(_get_service)):
    return await service.get_dau_mau_trend(params)


@router.get("/usage_ratio")
async def get_usage_ratio(params: FilterParams = Depends(), service: AdoptionService = Depends(_get_service)):
    return await service.get_usage_ratio(params)


@router.get("/new_user_trend")
async def get_new_user_trend(params: FilterParams = Depends(), service: AdoptionService = Depends(_get_service)):
    return await service.get_new_user_trend(params)


@router.get("/channel_active_users")
async def get_channel_active_users(params: FilterParams = Depends(), service: AdoptionService = Depends(_get_service)):
    return await service.get_channel_active_users(params)


@router.get("/model_user_count")
async def get_model_user_count(params: FilterParams = Depends(), service: AdoptionService = Depends(_get_service)):
    return await service.get_model_user_count(params)


@router.get("/activity_heatmap")
async def get_activity_heatmap(params: FilterParams = Depends(), service: AdoptionService = Depends(_get_service)):
    return await service.get_activity_heatmap(params)


@router.get("/project_ranking")
async def get_project_ranking(params: FilterParams = Depends(), service: AdoptionService = Depends(_get_service)):
    return await service.get_project_ranking(params)


@router.get("/user_penetration")
async def get_user_penetration(params: FilterParams = Depends(), service: AdoptionService = Depends(_get_service)):
    return await service.get_user_penetration(params)


@router.get("/org_user_distribution")
async def get_org_user_distribution(params: FilterParams = Depends(), service: AdoptionService = Depends(_get_service)):
    return await service.get_org_user_distribution(params)
