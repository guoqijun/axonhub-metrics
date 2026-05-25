from fastapi import APIRouter, Depends
from databases import Database

from app.database import get_db
from app.services.base import FilterParams
from app.services.channels import ChannelsService

router = APIRouter()


def _get_service(db: Database = Depends(get_db)) -> ChannelsService:
    return ChannelsService(db)


@router.get("/comparison_table")
async def get_comparison_table(params: FilterParams = Depends(), service: ChannelsService = Depends(_get_service)):
    return await service.get_comparison_table(params)


@router.get("/latency_comparison")
async def get_latency_comparison(params: FilterParams = Depends(), service: ChannelsService = Depends(_get_service)):
    return await service.get_latency_comparison(params)


@router.get("/latency_heatmap")
async def get_latency_heatmap(params: FilterParams = Depends(), service: ChannelsService = Depends(_get_service)):
    return await service.get_latency_heatmap(params)


@router.get("/health_scores")
async def get_health_scores(params: FilterParams = Depends(), service: ChannelsService = Depends(_get_service)):
    return await service.get_health_scores(params)


@router.get("/error_trend_overlay")
async def get_error_trend_overlay(params: FilterParams = Depends(), service: ChannelsService = Depends(_get_service)):
    return await service.get_error_trend_overlay(params)


@router.get("/quota_status")
async def get_quota_status(params: FilterParams = Depends(), service: ChannelsService = Depends(_get_service)):
    return await service.get_quota_status(params)


@router.get("/price_comparison")
async def get_price_comparison(params: FilterParams = Depends(), service: ChannelsService = Depends(_get_service)):
    return await service.get_price_comparison(params)
