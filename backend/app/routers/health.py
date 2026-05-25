from fastapi import APIRouter, Depends
from databases import Database

from app.database import get_db
from app.services.base import FilterParams
from app.services.health import HealthService

router = APIRouter()


def _get_service(db: Database = Depends(get_db)) -> HealthService:
    return HealthService(db)


@router.get("/latency_trend")
async def get_latency_trend(params: FilterParams = Depends(), service: HealthService = Depends(_get_service)):
    return await service.get_latency_trend(params)


@router.get("/channel_health_ranking")
async def get_channel_health_ranking(params: FilterParams = Depends(), service: HealthService = Depends(_get_service)):
    return await service.get_channel_health_ranking(params)


@router.get("/slow_requests")
async def get_slow_requests(params: FilterParams = Depends(), service: HealthService = Depends(_get_service)):
    return await service.get_slow_requests(params)


@router.get("/quota_alert_list")
async def get_quota_alert_list(params: FilterParams = Depends(), service: HealthService = Depends(_get_service)):
    return await service.get_quota_alert_list(params)


@router.get("/probe_trend")
async def get_probe_trend(params: FilterParams = Depends(), service: HealthService = Depends(_get_service)):
    return await service.get_probe_trend(params)


@router.get("/cache_hit_trend")
async def get_cache_hit_trend(params: FilterParams = Depends(), service: HealthService = Depends(_get_service)):
    return await service.get_cache_hit_trend(params)


@router.get("/availability_calendar")
async def get_availability_calendar(params: FilterParams = Depends(), service: HealthService = Depends(_get_service)):
    return await service.get_availability_calendar(params)
