# API 参考文档

Base URL: `http://localhost:8000/api`

认证方式: Bearer Token (在 `Authorization` 请求头中携带)

## 通用筛选参数

以下参数适用于所有业务 API（auth、meta 除外），通过 query string 传递：

| 参数 | 类型 | 说明 |
|------|------|------|
| `start_date` | string | 开始日期 (YYYY-MM-DD) |
| `end_date` | string | 结束日期 (YYYY-MM-DD) |
| `granularity` | enum | 聚合粒度: `day` / `week` / `month` (默认: day) |
| `user_ids` | string | 用户 ID 列表，逗号分隔 |
| `channel_ids` | string | 渠道 ID 列表，逗号分隔 |
| `model_ids` | string | 模型 ID 列表，逗号分隔 |

---

## 1. 认证 (Auth)

### POST `/auth/login`
管理员登录。

**Request Body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expire_hours": 24
}
```

### POST `/auth/init`
首次初始化管理员账号（仅可执行一次）。

**Request Body:** 同上

**Response (200):** 同上

### GET `/auth/me`
获取当前登录用户信息。

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "username": "admin"
}
```

---

## 2. 元数据 (Meta)

### GET `/meta/users`
获取所有用户列表。

**Response:**
```json
[{"id": 1}, {"id": 2}]
```

### GET `/meta/channels`
获取所有渠道列表。

**Response:**
```json
[{"id": 1, "name": "OpenAI"}, {"id": 2, "name": "Azure"}]
```

### GET `/meta/models`
获取所有模型列表。

**Response:**
```json
[{"id": "gpt-4"}, {"id": "gpt-3.5-turbo"}]
```

### GET `/meta/projects`
获取所有项目列表。

**Response:**
```json
[{"id": 1, "name": "Project A"}]
```

---

## 3. 概览 (Overview)

### GET `/overview/kpi`
核心 KPI 指标。

**Response:**
```json
{
  "today_requests": 15234,
  "dau": 892,
  "success_rate": 0.983,
  "today_cost": 45.67,
  "total_requests_30d": 452301,
  "avg_latency_ms": 1234.56
}
```

### GET `/overview/requests_trend`
请求量趋势。

**Response:**
```json
[{"date": "2025-01-01", "value": 15000}]
```

### GET `/overview/token_trend`
Token 消耗趋势 (Prompt vs Completion)。

**Response:**
```json
[{"date": "2025-01-01", "prompt_tokens": 500000, "completion_tokens": 200000}]
```

### GET `/overview/model_distribution`
模型请求分布。

**Response:**
```json
[{"model_id": "gpt-4", "request_count": 5000, "percentage": 33.33}]
```

### GET `/overview/error_trend`
错误率趋势。

**Response:**
```json
[{"date": "2025-01-01", "error_rate": 1.23, "error_count": 50, "total_count": 4050}]
```

---

## 4. 推广覆盖度 (Adoption)

### GET `/adoption/dau_mau_trend`
DAU/MAU 趋势。

**Response:**
```json
[{"date": "2025-01-01", "dau": 500, "mau": 2000}]
```

### GET `/adoption/usage_ratio`
使用率 (活跃用户 / 总用户)。

**Response:**
```json
{"active_users": 500, "total_users": 2000, "ratio": 0.25}
```

### GET `/adoption/new_user_trend`
新增用户趋势。

**Response:**
```json
[{"date": "2025-01-01", "value": 50}]
```

### GET `/adoption/channel_active_users`
渠道活跃用户数。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "active_users": 300}]
```

### GET `/adoption/model_user_count`
模型用户分布。

**Response:**
```json
[{"model_id": "gpt-4", "user_count": 400}]
```

### GET `/adoption/activity_heatmap`
活跃热力图 (星期 × 小时)。

**Response:**
```json
[{"day_of_week": 2, "hour": 10, "user_count": 45}]
```

### GET `/adoption/project_ranking`
项目请求排行 (Top 20)。

**Response:**
```json
[{"project_id": 1, "project_name": "AI Assistant", "request_count": 10000, "user_count": 150}]
```

---

## 5. 深度使用 (Usage)

### GET `/usage/avg_conversation_rounds`
平均对话轮次。

**Response:**
```json
{"avg_rounds": 3.5, "total_conversations": 12000}
```

### GET `/usage/avg_tokens_per_request`
每次请求平均 Token 消耗。

**Response:**
```json
{"avg_tokens": 450.5, "avg_prompt": 300.2, "avg_completion": 150.3}
```

### GET `/usage/session_duration`
会话时长分布。

**Response:**
```json
[{"bucket": "1-5m", "count": 500}, {"bucket": "5-15m", "count": 300}]
```

### GET `/usage/request_frequency_buckets`
用户请求频率分布。

**Response:**
```json
[{"bucket": "2-5", "user_count": 200}, {"bucket": "6-20", "user_count": 100}]
```

### GET `/usage/channel_daily_requests`
渠道日均请求量。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "daily_avg": 2500.5}]
```

### GET `/usage/stream_ratio`
流式请求占比。

**Response:**
```json
{"stream_count": 8000, "total_count": 10000, "stream_ratio": 0.8}
```

### GET `/usage/user_retention_cohort`
用户留存队列分析。

**Response:**
```json
[{"cohort": "2025-01", "active_month": "2025-02", "active_users": 120}]
```

### GET `/usage/daily_per_capita`
人均请求量。

**Response:**
```json
[{"date": "2025-01-01", "total_requests": 15000, "active_users": 500, "per_capita": 30.0}]
```

---

## 6. 产出与价值 (Value)

### GET `/value/heavy_users`
重度用户排行 (Top 20)。

**Response:**
```json
[{"user_id": 1, "email": "user@example.com", "name": "John Doe", "request_count": 5000, "total_tokens": 2500000, "total_cost": 125.5}]
```

### GET `/value/token_ranking`
模型 Token 使用排行。

**Response:**
```json
[{"model_id": "gpt-4", "total_prompt": 1000000, "total_completion": 500000, "total_tokens": 1500000}]
```

### GET `/value/rfm_matrix`
RFM 用户价值矩阵。

**Response:**
```json
[{"quadrant": "高频率-高价值", "user_count": 50}, {"quadrant": "低频率-低价值", "user_count": 500}]
```

### GET `/value/channel_efficiency`
渠道 Token 效率 (每美元 Token 数)。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "request_count": 5000, "total_tokens": 2500000, "total_cost": 125.5, "tokens_per_dollar": 19920.32}]
```

### GET `/value/project_contribution`
项目贡献趋势。

**Response:**
```json
[{"date": "2025-01-01", "project_id": 1, "project_name": "AI Assistant", "request_count": 500, "total_tokens": 250000}]
```

### GET `/value/model_output_ranking`
模型输出量排行。

**Response:**
```json
[{"model_id": "gpt-4", "request_count": 5000, "total_tokens": 2500000, "completion_tokens": 1000000, "avg_completion_per_request": 200.5}]
```

---

## 7. 成本分析 (Cost)

### GET `/cost/token_fee_trend`
Token 费用趋势。

**Response:**
```json
[{"date": "2025-01-01", "prompt_tokens": 500000, "completion_tokens": 200000, "total_cost": 45.5}]
```

### GET `/cost/model_distribution`
模型成本分布。

**Response:**
```json
[{"model_id": "gpt-4", "total_cost": 2000.5, "request_count": 50000, "total_tokens": 25000000}]
```

### GET `/cost/channel_comparison`
渠道成本对比。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "total_cost": 1500.0, "request_count": 30000, "avg_cost_per_request": 0.05}]
```

### GET `/cost/user_top`
用户成本排行 (Top 20)。

**Response:**
```json
[{"user_id": 1, "email": "user@example.com", "name": "John Doe", "total_cost": 500.0, "request_count": 10000, "total_tokens": 5000000}]
```

### GET `/cost/project_daily_cost`
项目每日成本。

**Response:**
```json
[{"date": "2025-01-01", "project_id": 1, "project_name": "AI Assistant", "total_cost": 50.0}]
```

### GET `/cost/cache_hit_rate`
缓存命中率趋势。

**Response:**
```json
[{"date": "2025-01-01", "prompt_tokens": 500000, "cached_tokens": 100000, "cache_hit_pct": 20.0}]
```

### GET `/cost/reasoning_ratio`
推理 Token 占比趋势。

**Response:**
```json
[{"date": "2025-01-01", "completion_tokens": 200000, "reasoning_tokens": 50000, "reasoning_pct": 25.0}]
```

### GET `/cost/forecast`
成本预测 (线性回归, 未来 7 天)。

**Response:**
```json
[{"date": "2025-01-01", "actual": 45.5, "forecast": null}, {"date": "2025-01-08", "actual": null, "forecast": 50.2}]
```

---

## 8. 错误分析 (Errors)

### GET `/errors/rate_trend`
错误率趋势。

**Response:**
```json
[{"date": "2025-01-01", "total_count": 5000, "error_count": 50, "error_rate": 1.0}]
```

### GET `/errors/type_distribution`
错误类型分布。

**Response:**
```json
[{"status": "failed", "count": 30}, {"status": "canceled", "count": 20}]
```

### GET `/errors/by_model`
按模型的错误分析。

**Response:**
```json
[{"model_id": "gpt-4", "total_count": 5000, "error_count": 50, "error_rate": 1.0}]
```

### GET `/errors/by_channel`
按渠道的错误分析。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "total_count": 5000, "error_count": 50, "error_rate": 1.0}]
```

### GET `/errors/heatmap`
错误热力图 (星期 × 小时)。

**Response:**
```json
[{"day_of_week": 2, "hour": 10, "error_count": 10}]
```

### GET `/errors/top_failing_users`
失败用户排行 (Top 20)。

**Response:**
```json
[{"user_id": 1, "email": "user@example.com", "name": "John Doe", "total_count": 1000, "error_count": 100, "error_rate": 10.0}]
```

### GET `/errors/channel_error_matrix`
渠道-错误类型交叉矩阵。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "status": "failed", "count": 30}]
```

### GET `/errors/retry_success_rate`
重试成功率分类。

**Response:**
```json
[{"category": "全部成功", "trace_count": 500}, {"category": "部分成功", "trace_count": 50}, {"category": "全部失败", "trace_count": 20}]
```

### GET `/errors/status_code_distribution`
状态码分布。

**Response:**
```json
[{"status": "completed", "count": 4950}, {"status": "failed", "count": 50}]
```

---

## 9. 多渠道对比 (Channels)

### GET `/channels/comparison_table`
渠道综合对比表。

**Response:**
```json
[{
  "channel_id": 1, "channel_name": "OpenAI", "channel_type": "direct",
  "request_count": 50000, "user_count": 300, "avg_latency": 1200.5,
  "total_cost": 2000.0, "total_tokens": 10000000, "error_count": 100,
  "error_rate": 0.2, "model_count": 5
}]
```

### GET `/channels/latency_comparison`
渠道延迟对比。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "avg_latency": 1200.5, "max_latency": 5000.0}]
```

### GET `/channels/latency_heatmap`
渠道延迟热力图 (渠道 × 小时)。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "hour": 10, "avg_latency": 1100.5}]
```

### GET `/channels/health_scores`
渠道健康评分。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "total_requests": 50000, "error_count": 100, "error_rate": 0.2, "avg_latency": 1200.5, "health_score": 87.5}]
```

### GET `/channels/error_trend_overlay`
渠道错误趋势叠加。

**Response:**
```json
[{"date": "2025-01-01", "channel_id": 1, "channel_name": "OpenAI", "total_count": 1000, "error_count": 10, "error_rate": 1.0}]
```

### GET `/channels/quota_status`
渠道配额状态。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "provider_type": "openai", "status": "active", "ready": true, "next_reset_at": "2025-02-01", "next_check_at": "2025-01-15"}]
```

### GET `/channels/price_comparison`
渠道价格对比 (每 Token 成本)。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "model_id": "gpt-4", "avg_cost_per_token": 0.00003, "request_count": 10000}]
```

---

## 10. 系统健康度 (Health)

### GET `/health/latency_trend`
延迟百分位趋势 (P50 / P95 / P99)。

**Response:**
```json
[{"date": "2025-01-01", "p50_latency": 800.5, "p95_latency": 3000.0, "p99_latency": 5000.0}]
```

### GET `/health/channel_health_ranking`
渠道健康排行。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "total_requests": 50000, "success_rate": 99.5, "avg_latency": 1200.5, "health_score": 85.0}]
```

### GET `/health/slow_requests`
慢请求列表 (Top 50)。

**Response:**
```json
[{"request_id": 12345, "model_id": "gpt-4", "channel_name": "OpenAI", "latency_ms": 15000.0, "status": "completed", "created_at": "2025-01-01 12:00:00"}]
```

### GET `/health/quota_alert_list`
配额告警列表。

**Response:**
```json
[{"channel_id": 1, "channel_name": "OpenAI", "provider_type": "openai", "status": "warning", "ready": true, "next_reset_at": "2025-02-01"}]
```

### GET `/health/probe_trend`
探针性能趋势 (Token/s, TTFT)。

**Response:**
```json
[{"date": "2025-01-01", "channel_id": 1, "channel_name": "OpenAI", "avg_tokens_per_second": 45.5, "avg_time_to_first_token_ms": 350.2, "request_count": 100}]
```

### GET `/health/cache_hit_trend`
缓存命中率趋势。

**Response:**
```json
[{"date": "2025-01-01", "prompt_tokens": 500000, "cached_tokens": 100000, "cache_hit_pct": 20.0}]
```

### GET `/health/availability_calendar`
可用性日历。

**Response:**
```json
[{"date": "2025-01-01", "total_requests": 5000, "success_count": 4950, "availability_pct": 99.0}]
```

---

## 11. 增长趋势 (Growth)

### GET `/growth/mom_yoy`
月度环比/同比增长。

**Response:**
```json
[{
  "month": "2025-01", "request_count": 50000, "request_growth_pct": 10.5,
  "user_count": 500, "user_growth_pct": 5.2, "total_tokens": 25000000,
  "token_growth_pct": 15.0, "total_cost": 2000.0, "cost_growth_pct": 8.5
}]
```

### GET `/growth/forecast`
增长预测 (requests / users)。

**Response:**
```json
[{"date": "2025-01-01", "metric": "requests", "actual": 50000.0, "forecast": null}, {"date": "2025-01-01", "metric": "requests", "actual": null, "forecast": 52000.0}]
```

### GET `/growth/user_growth_curve`
用户增长曲线。

**Response:**
```json
[{"date": "2025-01-01", "new_users": 50, "cumulative_users": 1000}]
```

### GET `/growth/model_growth_rate`
模型增长率。

**Response:**
```json
[{"model_id": "gpt-4", "month": "2025-01", "request_count": 30000}]
```

### GET `/growth/channel_market_share`
渠道市场份额。

**Response:**
```json
[{"month": "2025-01", "channel_id": 1, "channel_name": "OpenAI", "request_count": 40000, "share_pct": 80.0}]
```

### GET `/growth/project_growth_ranking`
项目增长排行。

**Response:**
```json
[{"project_id": 1, "project_name": "AI Assistant", "request_count": 50000, "user_count": 300}]
```

---

## 健康检查

### GET `/api/health`
服务健康检查。

**Response:**
```json
{"status": "ok"}
```
