from fastapi import APIRouter, Depends
from databases import Database

from app.database import get_db
from app.services.base import FilterParams
from app.services.usage import UsageService

router = APIRouter()


def _get_service(db: Database = Depends(get_db)) -> UsageService:
    return UsageService(db)


@router.get("/avg_conversation_rounds")
async def get_avg_conversation_rounds(params: FilterParams = Depends(), service: UsageService = Depends(_get_service)):
    return await service.get_avg_conversation_rounds(params)


@router.get("/avg_tokens_per_request")
async def get_avg_tokens_per_request(params: FilterParams = Depends(), service: UsageService = Depends(_get_service)):
    return await service.get_avg_tokens_per_request(params)


@router.get("/session_duration")
async def get_session_duration(params: FilterParams = Depends(), service: UsageService = Depends(_get_service)):
    return await service.get_session_duration(params)


@router.get("/request_frequency_buckets")
async def get_request_frequency_buckets(params: FilterParams = Depends(), service: UsageService = Depends(_get_service)):
    return await service.get_request_frequency_buckets(params)


@router.get("/channel_daily_requests")
async def get_channel_daily_requests(params: FilterParams = Depends(), service: UsageService = Depends(_get_service)):
    return await service.get_channel_daily_requests(params)


@router.get("/stream_ratio")
async def get_stream_ratio(params: FilterParams = Depends(), service: UsageService = Depends(_get_service)):
    return await service.get_stream_ratio(params)


@router.get("/user_retention_cohort")
async def get_user_retention_cohort(params: FilterParams = Depends(), service: UsageService = Depends(_get_service)):
    return await service.get_user_retention_cohort(params)


@router.get("/daily_per_capita")
async def get_daily_per_capita(params: FilterParams = Depends(), service: UsageService = Depends(_get_service)):
    return await service.get_daily_per_capita(params)
