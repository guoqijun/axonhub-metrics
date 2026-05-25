from fastapi import APIRouter, Depends
from databases import Database

from app.database import get_db
from app.services.base import FilterParams
from app.services.errors import ErrorsService

router = APIRouter()


def _get_service(db: Database = Depends(get_db)) -> ErrorsService:
    return ErrorsService(db)


@router.get("/rate_trend")
async def get_rate_trend(params: FilterParams = Depends(), service: ErrorsService = Depends(_get_service)):
    return await service.get_rate_trend(params)


@router.get("/type_distribution")
async def get_type_distribution(params: FilterParams = Depends(), service: ErrorsService = Depends(_get_service)):
    return await service.get_type_distribution(params)


@router.get("/by_model")
async def get_by_model(params: FilterParams = Depends(), service: ErrorsService = Depends(_get_service)):
    return await service.get_by_model(params)


@router.get("/by_channel")
async def get_by_channel(params: FilterParams = Depends(), service: ErrorsService = Depends(_get_service)):
    return await service.get_by_channel(params)


@router.get("/heatmap")
async def get_heatmap(params: FilterParams = Depends(), service: ErrorsService = Depends(_get_service)):
    return await service.get_heatmap(params)


@router.get("/top_failing_users")
async def get_top_failing_users(params: FilterParams = Depends(), service: ErrorsService = Depends(_get_service)):
    return await service.get_top_failing_users(params)


@router.get("/channel_error_matrix")
async def get_channel_error_matrix(params: FilterParams = Depends(), service: ErrorsService = Depends(_get_service)):
    return await service.get_channel_error_matrix(params)


@router.get("/retry_success_rate")
async def get_retry_success_rate(params: FilterParams = Depends(), service: ErrorsService = Depends(_get_service)):
    return await service.get_retry_success_rate(params)


@router.get("/status_code_distribution")
async def get_status_code_distribution(params: FilterParams = Depends(), service: ErrorsService = Depends(_get_service)):
    return await service.get_status_code_distribution(params)
