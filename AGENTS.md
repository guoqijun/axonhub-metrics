# AxonHub Metrics — AGENTS.md

## 项目概述

AI 运营指标可视化平台。后端提供 REST API 并托管前端静态文件，前端 SPA 消费数据并展示图表。生产环境只需启动一个服务。

## 技术栈

- **后端**: Python 3.10+ / FastAPI / MySQL (aiomysql) / JWT
- **前端**: React 18 / TypeScript 5 / Vite 5 / Ant Design 5 / Zustand
- **图表**: @ant-design/charts (基于 G2Plot)
- **HTTP**: Axios (拦截器自动注入 JWT、处理 401)
- **部署**: 单服务架构 — FastAPI 托管 REST API + 前端静态文件

## 架构规范

### 整体架构

```
FastAPI (port 8000)
  ├── /api/* → Routers → Services → MySQL
  ├── /      → StaticFiles (backend/static/, html=True)
  └── SPA fallback: 非 API 路径自动返回 index.html
```

- Vite 构建前端输出到 `backend/static/`，由 FastAPI `StaticFiles` 托管
- `StaticFiles(html=True)` 自动处理 SPA HTML5 History fallback
- `/api/*` 路由优先级高于静态文件挂载，API 请求不受影响
- 未构建前端时 `static/` 目录不存在，API 服务仍可正常启动

### 分层架构 (后端)

```
Router (路由/参数解析) → Service (SQL 查询) → Pydantic Model (响应)
```

- Router 只做参数提取和依赖注入，不写业务逻辑
- Service 负责 SQL 查询和结果组装
- Model 定义 Pydantic 响应结构，所有字段提供默认值

### 筛选机制

所有业务 API 统一使用 `FilterParams` (来自 `app/services/base.py`):
- `start_date` / `end_date`: 日期范围
- `granularity`: day / week / month
- `user_ids` / `channel_ids` / `model_ids`: 多选筛选
- 助手函数 `apply_filters()` 生成 WHERE 子句和 bind 参数
- 助手函数 `date_trunc_expr()` 生成按日/周/月聚合的 SQL 表达式

## 代码规范

### 通用
- 后端使用 async/await，数据库操作为异步
- SQL 使用参数化查询（:param 语法），禁止拼接字符串（避免 SQL 注入）
- 模型字段提供默认值，保证 JSON 序列化不会缺失

### 后端文件命名与导入
- models / routers / services 目录下的文件使用单数命名（overview.py 而非 overviews.py）
- 导入路径使用 `app.models.xxx`, `app.routers.xxx`, `app.services.xxx`
- Router 使用 `Depends()` 注入 Service 和 DB 连接

### 前端文件命名与导入
- 页面组件放在 `pages/`，首字母大写 PascalCase
- 通用组件放在 `components/`，首字母大写 PascalCase
- API 层放在 `api/`，使用 camelCase 命名导出函数
- Stores 放在 `stores/`，使用 `useXxxStore` 命名 hook
- Hooks 放在 `hooks/`，使用 `useXxx` 命名

### 前端组件约定
- `ChartCard`: 图表容器，自带 Loading / Error (含重试) / Empty 三态处理
- `KPICard`: KPI 数字展示，支持趋势箭头
- `FilterBar`: 全局筛选器，通过 Zustand store 共享状态
- `MetricTable`: 基于 Ant Design Table 的封装，超出 20 行自动分页

### 状态管理
- 认证状态 (`stores/auth.ts`): 使用 zustand/persist，localStorage 持久化
- 筛选状态 (`hooks/useFilters.ts`): Zustand store，默认最近 30 天
- API 响应拦截器自动处理 401 → 清除 token → 跳转登录页

## 开发工作流

### 添加新页面/模块
1. `backend/app/models/` → 定义响应模型
2. `backend/app/services/` → 实现查询逻辑
3. `backend/app/routers/` → 注册路由
4. `frontend/src/api/metrics.ts` → 添加 API 调用函数
5. `frontend/src/pages/` → 创建页面组件
6. `frontend/src/router.tsx` → 注册路由和侧边栏菜单

### 本地开发
```bash
# 后端 (backend/)
uvicorn app.main:app --reload --port 8000

# Vite 开发模式 (前端热更新, 选其一)
cd frontend && npm run dev   # 端口 5173，自动代理 /api → :8000
```

## 构建与部署

前端由 FastAPI 直接托管，无需额外配置 Web 服务器。

```bash
# 1. 安装后端依赖
cd backend && pip install -r requirements.txt

# 2. 构建前端 (输出到 backend/static/)
cd frontend && npm install && npm run build

# 3. 启动 (单服务)
cd backend && uvicorn app.main:app --port 8000
```

访问 http://localhost:8000 即可使用完整应用。

### 构建机制

```dot
frontend/vite.config.ts
  → build.outDir = ../backend/static
  → 构建产物由 FastAPI StaticFiles 托管
  → html=True 参数提供 SPA fallback（刷新非根路由不 404）
```

## 数据库表结构 (关键表)

- `usage_logs`: model_id, channel_id, api_key_id, prompt_tokens, completion_tokens, total_cost, created_at
- `requests`: 关联 usage_logs.request_id, status, metrics_latency_ms
- `api_keys`: user_id → api_key 映射
- `channels`: id, name
- `projects`: id, name
- `admin_users`: username, password_hash

## API 设计

所有 API 返回 JSON，统一筛选参数通过 query string 传递。
认证使用 Bearer Token，通过 `Authorization` 请求头携带。
Token 过期默认 24 小时，可通过 `.env` 配置。
