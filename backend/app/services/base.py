from typing import Optional, Literal
from pydantic import BaseModel


class FilterParams(BaseModel):
    model_config = {"protected_namespaces": ()}

    start_date: Optional[str] = None
    end_date: Optional[str] = None
    granularity: Literal["day", "week", "month"] = "day"
    user_ids: Optional[list[str]] = None
    channel_ids: Optional[list[int]] = None
    model_ids: Optional[list[str]] = None
    project_id: Optional[int] = None


def date_trunc_expr(granularity: str, column: str = "ul.created_at") -> str:
    if granularity == "day":
        return f"DATE({column})"
    elif granularity == "week":
        return f"DATE_SUB(DATE({column}), INTERVAL WEEKDAY({column}) DAY)"
    elif granularity == "month":
        return f"DATE_FORMAT({column}, '%Y-%m-01')"
    return f"DATE({column})"


def apply_filters(params: FilterParams, table_alias: str = "ul") -> tuple[str, dict]:
    """Build WHERE clause and bind parameters from FilterParams.
    Returns (where_clause, bind_dict).
    """
    conditions = ["1=1"]
    bind = {}

    if params.start_date:
        conditions.append(f"DATE({table_alias}.created_at) >= :start_date")
        bind["start_date"] = params.start_date
    if params.end_date:
        conditions.append(f"DATE({table_alias}.created_at) <= :end_date")
        bind["end_date"] = params.end_date
    if params.user_ids:
        # employee_id is on api_keys table, filter usage_logs via api_key_id
        placeholders = ", ".join([f":uid_{i}" for i in range(len(params.user_ids))])
        conditions.append(f"{table_alias}.api_key_id IN (SELECT id FROM api_keys WHERE employee_id IN ({placeholders}))")
        for i, uid in enumerate(params.user_ids):
            bind[f"uid_{i}"] = uid
    if params.channel_ids:
        placeholders = ", ".join([f":cid_{i}" for i in range(len(params.channel_ids))])
        conditions.append(f"{table_alias}.channel_id IN ({placeholders})")
        for i, cid in enumerate(params.channel_ids):
            bind[f"cid_{i}"] = cid
    if params.model_ids:
        placeholders = ", ".join([f":mid_{i}" for i in range(len(params.model_ids))])
        conditions.append(f"{table_alias}.model_id IN ({placeholders})")
        for i, mid in enumerate(params.model_ids):
            bind[f"mid_{i}"] = mid

    return " AND ".join(conditions), bind
