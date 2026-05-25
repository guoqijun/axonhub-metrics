from typing import List
from databases import Database
from app.database import get_db
from app.models.value import (
    HeavyUser, TokenRanking, RFMQuadrant, ChannelEfficiency,
    ProjectContributionPoint, ModelOutputRanking,
)
from app.services.base import FilterParams, date_trunc_expr, apply_filters


class ValueService:
    def __init__(self, db: Database):
        self.db = db

    async def get_heavy_users(self, params: FilterParams) -> List[HeavyUser]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ak.user_id, u.email, u.first_name, u.last_name,
                   COUNT(*) as request_count,
                   COALESCE(SUM(ul.total_tokens), 0) as total_tokens,
                   COALESCE(SUM(ul.total_cost), 0) as total_cost
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            LEFT JOIN users u ON ak.user_id = u.id
            WHERE {where}
            GROUP BY ak.user_id
            ORDER BY request_count DESC
            LIMIT 20
        """, bind)

        return [
            HeavyUser(
                user_id=r["user_id"],
                email=r["email"],
                name=(r["first_name"] or "") + " " + (r["last_name"] or ""),
                request_count=r["request_count"],
                total_tokens=r["total_tokens"],
                total_cost=float(r["total_cost"] or 0),
            )
            for r in rows
        ]

    async def get_token_ranking(self, params: FilterParams) -> List[TokenRanking]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.model_id,
                   COALESCE(SUM(ul.prompt_tokens), 0) as total_prompt,
                   COALESCE(SUM(ul.completion_tokens), 0) as total_completion,
                   COALESCE(SUM(ul.total_tokens), 0) as total_tokens
            FROM usage_logs ul
            WHERE {where}
            GROUP BY ul.model_id
            ORDER BY total_tokens DESC
        """, bind)

        return [
            TokenRanking(
                model_id=r["model_id"],
                total_prompt=r["total_prompt"],
                total_completion=r["total_completion"],
                total_tokens=r["total_tokens"],
            )
            for r in rows
        ]

    async def get_rfm_matrix(self, params: FilterParams) -> List[RFMQuadrant]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT
                CASE
                    WHEN req_count >= 100 AND total_cost >= 10 THEN '高频率-高价值'
                    WHEN req_count >= 100 AND total_cost < 10 THEN '高频率-低价值'
                    WHEN req_count < 100 AND total_cost >= 10 THEN '低频率-高价值'
                    ELSE '低频率-低价值'
                END as quadrant,
                COUNT(*) as user_count
            FROM (
                SELECT ak.user_id,
                       COUNT(*) as req_count,
                       COALESCE(SUM(ul.total_cost), 0) as total_cost
                FROM usage_logs ul
                LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
                WHERE {where}
                GROUP BY ak.user_id
            ) t
            GROUP BY quadrant
            ORDER BY quadrant
        """, bind)

        return [RFMQuadrant(quadrant=r["quadrant"], user_count=r["user_count"]) for r in rows]

    async def get_channel_efficiency(self, params: FilterParams) -> List[ChannelEfficiency]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name,
                   COUNT(*) as request_count,
                   COALESCE(SUM(ul.total_tokens), 0) as total_tokens,
                   COALESCE(SUM(ul.total_cost), 0) as total_cost
            FROM usage_logs ul
            LEFT JOIN channels c ON ul.channel_id = c.id
            WHERE {where}
            GROUP BY ul.channel_id
            ORDER BY total_tokens DESC
        """, bind)

        def _to_efficiency(r):
            tt = int(r["total_tokens"] or 0)
            tc = float(r["total_cost"] or 0)
            return ChannelEfficiency(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                request_count=r["request_count"],
                total_tokens=tt,
                total_cost=tc,
                tokens_per_dollar=round(tt / tc, 2) if tc > 0 else 0,
            )

        return [_to_efficiency(r) for r in rows]

    async def get_project_contribution(self, params: FilterParams) -> List[ProjectContributionPoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date, ul.project_id, p.name as project_name,
                   COUNT(*) as request_count,
                   COALESCE(SUM(ul.total_tokens), 0) as total_tokens
            FROM usage_logs ul
            LEFT JOIN projects p ON ul.project_id = p.id
            WHERE {where}
            GROUP BY {trunc}, ul.project_id
            ORDER BY date, ul.project_id
        """, bind)

        return [
            ProjectContributionPoint(
                date=str(r["date"]),
                project_id=r["project_id"],
                project_name=r["project_name"],
                request_count=r["request_count"],
                total_tokens=r["total_tokens"],
            )
            for r in rows
        ]

    async def get_model_output_ranking(self, params: FilterParams) -> List[ModelOutputRanking]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.model_id,
                   COUNT(*) as request_count,
                   COALESCE(SUM(ul.total_tokens), 0) as total_tokens,
                   COALESCE(SUM(ul.completion_tokens), 0) as completion_tokens,
                   COALESCE(AVG(ul.completion_tokens), 0) as avg_completion_per_request
            FROM usage_logs ul
            WHERE {where}
            GROUP BY ul.model_id
            ORDER BY total_tokens DESC
        """, bind)

        return [
            ModelOutputRanking(
                model_id=r["model_id"],
                request_count=r["request_count"],
                total_tokens=r["total_tokens"],
                completion_tokens=r["completion_tokens"],
                avg_completion_per_request=round(float(r["avg_completion_per_request"]), 2),
            )
            for r in rows
        ]
