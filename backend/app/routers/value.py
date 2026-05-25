from fastapi import APIRouter, Depends
from databases import Database

from app.database import get_db
from app.services.base import FilterParams
from app.services.value import ValueService

router = APIRouter()


def _get_service(db: Database = Depends(get_db)) -> ValueService:
    return ValueService(db)


@router.get("/heavy_users")
async def get_heavy_users(params: FilterParams = Depends(), service: ValueService = Depends(_get_service)):
    return await service.get_heavy_users(params)


@router.get("/token_ranking")
async def get_token_ranking(params: FilterParams = Depends(), service: ValueService = Depends(_get_service)):
    return await service.get_token_ranking(params)


@router.get("/rfm_matrix")
async def get_rfm_matrix(params: FilterParams = Depends(), service: ValueService = Depends(_get_service)):
    return await service.get_rfm_matrix(params)


@router.get("/channel_efficiency")
async def get_channel_efficiency(params: FilterParams = Depends(), service: ValueService = Depends(_get_service)):
    return await service.get_channel_efficiency(params)


@router.get("/project_contribution")
async def get_project_contribution(params: FilterParams = Depends(), service: ValueService = Depends(_get_service)):
    return await service.get_project_contribution(params)


@router.get("/model_output_ranking")
async def get_model_output_ranking(params: FilterParams = Depends(), service: ValueService = Depends(_get_service)):
    return await service.get_model_output_ranking(params)
