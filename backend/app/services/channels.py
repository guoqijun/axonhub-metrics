from typing import List, Optional
from databases import Database
from app.database import get_db
from app.models.channels import (
    ChannelComparison, ChannelLatency, ChannelLatencyHeatmapPoint,
    ChannelHealth, ChannelErrorTrendPoint, QuotaStatus, ChannelPricePoint,
)
from app.services.base import FilterParams, date_trunc_expr, apply_filters


class ChannelsService:
    def __init__(self, db: Database):
        self.db = db

    async def get_comparison_table(self, params: FilterParams) -> List[ChannelComparison]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name, c.type as channel_type,
                   COUNT(*) as request_count,
                   COUNT(DISTINCT ak.employee_id) as user_count,
                   COALESCE(AVG(r.metrics_latency_ms), 0) as avg_latency,
                   COALESCE(SUM(ul.total_cost), 0) as total_cost,
                   COALESCE(SUM(ul.total_tokens), 0) as total_tokens,
                   SUM(CASE WHEN r.status IN ('failed', 'canceled') THEN 1 ELSE 0 END) as error_count,
                   COUNT(DISTINCT ul.model_id) as model_count
            FROM usage_logs ul
            LEFT JOIN channels c ON ul.channel_id = c.id
            LEFT JOIN requests r ON ul.request_id = r.id
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            WHERE {where}
            GROUP BY ul.channel_id
            ORDER BY request_count DESC
        """, bind)

        return [
            ChannelComparison(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                channel_type=r["channel_type"],
                request_count=r["request_count"],
                user_count=r["user_count"],
                avg_latency=round(float(r["avg_latency"] or 0), 2),
                total_cost=float(r["total_cost"] or 0),
                total_tokens=r["total_tokens"],
                error_count=r["error_count"],
                error_rate=round(r["error_count"] / r["request_count"] * 100, 2) if r["request_count"] > 0 else 0,
                model_count=r["model_count"],
            )
            for r in rows
        ]

    async def get_latency_comparison(self, params: FilterParams) -> List[ChannelLatency]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name,
                   COALESCE(AVG(r.metrics_latency_ms), 0) as avg_latency,
                   COALESCE(MAX(r.metrics_latency_ms), 0) as max_latency
            FROM usage_logs ul
            LEFT JOIN channels c ON ul.channel_id = c.id
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where}
            GROUP BY ul.channel_id
            ORDER BY avg_latency DESC
        """, bind)

        return [
            ChannelLatency(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                avg_latency=round(float(r["avg_latency"] or 0), 2),
                max_latency=float(r["max_latency"] or 0),
            )
            for r in rows
        ]

    async def get_latency_heatmap(self, params: FilterParams) -> List[ChannelLatencyHeatmapPoint]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name,
                   HOUR(ul.created_at) as hour,
                   COALESCE(AVG(r.metrics_latency_ms), 0) as avg_latency
            FROM usage_logs ul
            LEFT JOIN channels c ON ul.channel_id = c.id
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where}
            GROUP BY ul.channel_id, HOUR(ul.created_at)
            ORDER BY ul.channel_id, hour
        """, bind)

        return [
            ChannelLatencyHeatmapPoint(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                hour=r["hour"],
                avg_latency=round(float(r["avg_latency"] or 0), 2),
            )
            for r in rows
        ]

    async def get_health_scores(self, params: FilterParams) -> List[ChannelHealth]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name,
                   COUNT(*) as total_requests,
                   SUM(CASE WHEN r.status IN ('failed', 'canceled') THEN 1 ELSE 0 END) as error_count,
                   COALESCE(AVG(r.metrics_latency_ms), 0) as avg_latency
            FROM usage_logs ul
            LEFT JOIN channels c ON ul.channel_id = c.id
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where}
            GROUP BY ul.channel_id
            ORDER BY total_requests DESC
        """, bind)

        def _calc(r):
            ec = r["error_count"]
            tr = r["total_requests"]
            error_rate = float(ec) / tr if tr > 0 else 0
            avg_lat = float(r["avg_latency"] or 0)
            score = round(max(0, 100 - error_rate * 100 - float(avg_lat) / 100), 2)
            return ChannelHealth(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                total_requests=tr,
                error_count=ec,
                error_rate=round(error_rate * 100, 2),
                avg_latency=avg_lat,
                health_score=score,
            )

        return [_calc(r) for r in rows]

    async def get_error_trend_overlay(self, params: FilterParams) -> List[ChannelErrorTrendPoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date, ul.channel_id, c.name as channel_name,
                   COUNT(*) as total_count,
                   SUM(CASE WHEN r.status IN ('failed', 'canceled') THEN 1 ELSE 0 END) as error_count
            FROM usage_logs ul
            LEFT JOIN channels c ON ul.channel_id = c.id
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where}
            GROUP BY {trunc}, ul.channel_id
            ORDER BY date, ul.channel_id
        """, bind)

        return [
            ChannelErrorTrendPoint(
                date=str(r["date"]),
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                total_count=r["total_count"],
                error_count=r["error_count"],
                error_rate=round(r["error_count"] / r["total_count"] * 100, 2) if r["total_count"] > 0 else 0,
            )
            for r in rows
        ]

    async def get_quota_status(self, params: FilterParams) -> List[QuotaStatus]:
        conditions = ["1=1"]
        bind = {}
        if params.channel_ids:
            placeholders = ", ".join([f":cid_{i}" for i in range(len(params.channel_ids))])
            conditions.append(f"pqs.channel_id IN ({placeholders})")
            for i, cid in enumerate(params.channel_ids):
                bind[f"cid_{i}"] = cid
        where = " AND ".join(conditions)

        try:
            rows = await self.db.fetch_all(f"""
                SELECT pqs.channel_id, c.name as channel_name,
                       pqs.provider_type, pqs.status, pqs.ready,
                       pqs.next_reset_at, pqs.next_check_at
                FROM provider_quota_status pqs
                LEFT JOIN channels c ON pqs.channel_id = c.id
                WHERE {where}
                ORDER BY pqs.channel_id
            """, bind)
        except Exception:
            return []

        return [
            QuotaStatus(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                provider_type=r["provider_type"],
                status=r["status"],
                ready=r["ready"],
                next_reset_at=str(r["next_reset_at"]) if r["next_reset_at"] else None,
                next_check_at=str(r["next_check_at"]) if r["next_check_at"] else None,
            )
            for r in rows
        ]

    async def get_price_comparison(self, params: FilterParams) -> List[ChannelPricePoint]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name, ul.model_id,
                   COALESCE(AVG(ul.total_cost / NULLIF(ul.total_tokens, 0)), 0) as avg_cost_per_token,
                   COUNT(*) as request_count
            FROM usage_logs ul
            LEFT JOIN channels c ON ul.channel_id = c.id
            WHERE {where} AND ul.total_tokens > 0
            GROUP BY ul.channel_id, ul.model_id
            ORDER BY ul.channel_id, avg_cost_per_token DESC
        """, bind)

        return [
            ChannelPricePoint(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                model_id=r["model_id"],
                avg_cost_per_token=round(float(r["avg_cost_per_token"] or 0), 8),
                request_count=r["request_count"],
            )
            for r in rows
        ]
