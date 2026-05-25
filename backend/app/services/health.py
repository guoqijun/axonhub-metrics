from typing import List
from databases import Database
from app.database import get_db
from app.models.health import (
    LatencyTrendPoint, ChannelHealthRanking, SlowRequest,
    QuotaAlert, ProbeTrendPoint, CacheHitTrendPoint,
    AvailabilityCalendarPoint,
)
from app.services.base import FilterParams, date_trunc_expr, apply_filters


class HealthService:
    def __init__(self, db: Database):
        self.db = db

    async def get_latency_trend(self, params: FilterParams) -> List[LatencyTrendPoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            WITH ranked AS (
                SELECT {trunc} as date,
                       r.metrics_latency_ms,
                       ROW_NUMBER() OVER (PARTITION BY {trunc} ORDER BY r.metrics_latency_ms) AS rn,
                       COUNT(*) OVER (PARTITION BY {trunc}) AS cnt
                FROM usage_logs ul
                JOIN requests r ON ul.request_id = r.id
                WHERE {where} AND r.metrics_latency_ms IS NOT NULL
            )
            SELECT date,
                   MAX(CASE WHEN rn / cnt <= 0.50 THEN metrics_latency_ms END) AS p50,
                   MAX(CASE WHEN rn / cnt <= 0.95 THEN metrics_latency_ms END) AS p95,
                   MAX(CASE WHEN rn / cnt <= 0.99 THEN metrics_latency_ms END) AS p99
            FROM ranked
            GROUP BY date
            ORDER BY date
        """, bind)

        return [
            LatencyTrendPoint(
                date=str(r["date"]),
                p50_latency=round(float(r["p50"] or 0), 2),
                p95_latency=round(float(r["p95"] or 0), 2),
                p99_latency=round(float(r["p99"] or 0), 2),
            )
            for r in rows
        ]

    async def get_channel_health_ranking(self, params: FilterParams) -> List[ChannelHealthRanking]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name,
                   COUNT(*) as total_requests,
                   SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) as success_count,
                   COALESCE(AVG(r.metrics_latency_ms), 0) as avg_latency
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            LEFT JOIN channels c ON ul.channel_id = c.id
            WHERE {where}
            GROUP BY ul.channel_id
            ORDER BY total_requests DESC
        """, bind)

        return [
            ChannelHealthRanking(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                total_requests=r["total_requests"],
                success_rate=round(float(r["success_count"]) / r["total_requests"] * 100, 2) if r["total_requests"] > 0 else 0,
                avg_latency=round(float(r["avg_latency"] or 0), 2),
                health_score=round(max(0, 100 - (r["total_requests"] - float(r["success_count"])) / r["total_requests"] * 100 - float(r["avg_latency"] or 0) / 200), 2) if r["total_requests"] > 0 else 0,
            )
            for r in rows
        ]

    async def get_slow_requests(self, params: FilterParams) -> List[SlowRequest]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT r.id as request_id, r.model_id, c.name as channel_name,
                   r.metrics_latency_ms, r.status, r.created_at
            FROM usage_logs ul
            JOIN requests r ON ul.request_id = r.id
            LEFT JOIN channels c ON ul.channel_id = c.id
            WHERE {where} AND r.metrics_latency_ms IS NOT NULL
            ORDER BY r.metrics_latency_ms DESC
            LIMIT 50
        """, bind)

        return [
            SlowRequest(
                request_id=r["request_id"],
                model_id=r["model_id"],
                channel_name=r["channel_name"],
                latency_ms=float(r["metrics_latency_ms"] or 0),
                status=r["status"],
                created_at=str(r["created_at"]),
            )
            for r in rows
        ]

    async def get_quota_alert_list(self, params: FilterParams) -> List[QuotaAlert]:
        conditions = ["pqs.status IN ('exhausted', 'warning')"]
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
                       pqs.provider_type, pqs.status, pqs.ready, pqs.next_reset_at
                FROM provider_quota_status pqs
                LEFT JOIN channels c ON pqs.channel_id = c.id
                WHERE {where}
                ORDER BY FIELD(pqs.status, 'exhausted', 'warning'), pqs.channel_id
            """, bind)
        except Exception:
            return []

        return [
            QuotaAlert(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                provider_type=r["provider_type"],
                status=r["status"],
                ready=r["ready"],
                next_reset_at=str(r["next_reset_at"]) if r["next_reset_at"] else None,
            )
            for r in rows
        ]

    async def get_probe_trend(self, params: FilterParams) -> List[ProbeTrendPoint]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT FROM_UNIXTIME(cp.timestamp, '%Y-%m-%d') as date,
                   cp.channel_id, c.name as channel_name,
                   COALESCE(AVG(cp.avg_tokens_per_second), 0) as avg_tokens_per_second,
                   COALESCE(AVG(cp.avg_time_to_first_token_ms), 0) as avg_time_to_first_token_ms,
                   SUM(cp.total_request_count) as request_count
            FROM usage_logs ul
            JOIN channels c ON ul.channel_id = c.id
            JOIN channel_probes cp ON cp.channel_id = c.id
            WHERE {where}
            GROUP BY date, cp.channel_id
            ORDER BY date, cp.channel_id
        """, bind)

        result = {}
        for r in rows:
            key = str(r["date"])
            if key not in result:
                result[key] = {"date": key, "tps_sum": 0, "ttft_sum": 0, "req_sum": 0, "count": 0}
            result[key]["tps_sum"] += float(r["avg_tokens_per_second"] or 0)
            result[key]["ttft_sum"] += float(r["avg_time_to_first_token_ms"] or 0)
            result[key]["req_sum"] += r["request_count"]
            result[key]["count"] += 1

        return [
            ProbeTrendPoint(
                date=v["date"],
                avg_tokens_per_second=round(v["tps_sum"] / v["count"], 2) if v["count"] > 0 else 0,
                avg_time_to_first_token_ms=round(v["ttft_sum"] / v["count"], 2) if v["count"] > 0 else 0,
                request_count=v["req_sum"],
            )
            for v in sorted(result.values(), key=lambda x: x["date"])
        ]

    async def get_cache_hit_trend(self, params: FilterParams) -> List[CacheHitTrendPoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date,
                   COALESCE(SUM(ul.prompt_tokens), 0) as prompt_tokens,
                   COALESCE(SUM(ul.prompt_cached_tokens), 0) as cached_tokens
            FROM usage_logs ul
            WHERE {where}
            GROUP BY {trunc}
            ORDER BY date
        """, bind)

        return [
            CacheHitTrendPoint(
                date=str(r["date"]),
                prompt_tokens=r["prompt_tokens"],
                cached_tokens=r["cached_tokens"],
                cache_hit_pct=round(r["cached_tokens"] / r["prompt_tokens"] * 100, 2) if r["prompt_tokens"] > 0 else 0,
            )
            for r in rows
        ]

    async def get_availability_calendar(self, params: FilterParams) -> List[AvailabilityCalendarPoint]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT DATE(ul.created_at) as date,
                   COUNT(*) as total_requests,
                   SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) as success_count
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where}
            GROUP BY DATE(ul.created_at)
            ORDER BY date
        """, bind)

        return [
            AvailabilityCalendarPoint(
                date=str(r["date"]),
                total_requests=r["total_requests"],
                success_count=r["success_count"],
                availability_pct=round(r["success_count"] / r["total_requests"] * 100, 2) if r["total_requests"] > 0 else 0,
            )
            for r in rows
        ]
