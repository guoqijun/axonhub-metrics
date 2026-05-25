# AxonHub Metrics

AI 运营指标可视化平台，用于追踪和分析组织内 AI/LLM API 的使用情况、成本、性能等多维度运营数据。

## 功能模块

| 模块 | 说明 |
|------|------|
| **概览** (Overview) | 今日请求量、日活跃用户、成功率、今日花费等核心 KPI |
| **推广覆盖度** (Adoption) | DAU/MAU 趋势、使用率、渠道活跃用户、模型用户分布、活跃热力图 |
| **深度使用** (Usage) | 对话轮次、Token 消耗、会话时长、请求频率、流式占比、留存队列 |
| **产出与价值** (Value) | 重度用户排行、Token 排行、RFM 矩阵、渠道效率、项目贡献度 |
| **成本分析** (Cost) | Token 费用趋势、模型成本分布、渠道对比、Top 用户成本、缓存命中率 |
| **错误分析** (Errors) | 错误率趋势、错误类型分布、按模型/渠道错误分析、失败用户排行 |
| **多渠道对比** (Channels) | 渠道综合对比、延迟对比、健康评分、配额状态、价格对比 |
| **系统健康度** (Health) | 延迟百分位趋势、渠道健康排行、慢请求、探针性能、可用性日历 |
| **增长趋势** (Growth) | 环比同比、增长预测、用户增长曲线、模型增长率、渠道市场份额 |

## 技术栈

### 后端
- **框架**: Python FastAPI
- **数据库**: MySQL + aiomysql (async)
- **认证**: JWT (PyJWT) + bcrypt 密码哈希
- **ORM**: databases 库 (raw SQL)

### 前端
- **框架**: React 18 + TypeScript
- **构建**: Vite 5
- **UI**: Ant Design 5 + @ant-design/charts
- **状态管理**: Zustand (persist 中间件)
- **HTTP**: Axios

## 快速启动

### 前置条件
- Python 3.10+
- Node.js 18+ (仅构建前端时需要)
- MySQL 8.0+

### 1. 后端环境

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量 (编辑 .env，可参考 .env.example)
# DATABASE_URL=mysql+aiomysql://user:password@localhost/axonhub
# SECRET_KEY=your-secret-key

# 初始化管理员账号
python scripts/init_admin.py admin your-password
```

### 2. 构建前端 (由后端托管)

```bash
cd frontend
npm install
npm run build    # 输出到 backend/static/
```

### 3. 启动服务

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

启动后，访问 **http://localhost:8000** 即可使用完整应用，无需额外启动前端服务器。

### 开发模式 (前后端热更新)

开发时可以使用 Vite 开发服务器获得热更新体验：

```bash
# 终端 1: 启动后端
cd backend && uvicorn app.main:app --reload --port 8000

# 终端 2: 启动 Vite 开发服务器 (端口 5173, 自动代理 /api 到后端)
cd frontend && npm run dev
```

开发环境访问 http://localhost:5173，Vite 自动将 `/api` 请求代理到后端。

### 访问
- 统一入口 (生产/合并模式): http://localhost:8000
- 前端开发服务器: http://localhost:5173
- API 文档: http://localhost:8000/docs

## 项目结构

```
axonhub-metrics/
├── package.json          # 根级构建脚本
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI 应用入口 (含静态文件托管)
│   │   ├── config.py            # 配置管理 (Pydantic Settings)
│   │   ├── database.py          # 数据库连接
│   │   ├── auth.py              # JWT 认证工具
│   │   ├── models/              # Pydantic 响应模型
│   │   ├── routers/             # API 路由层
│   │   └── services/            # 业务逻辑层 (SQL 查询)
│   ├── static/                  # 前端构建产物 (由 Vite 自动生成)
│   ├── scripts/
│   │   └── init_admin.py        # 管理员初始化脚本
│   ├── .env.example
│   ├── .gitignore
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── main.tsx             # 应用入口
│   │   ├── App.tsx              # 根组件 (ConfigProvider + Router)
│   │   ├── router.tsx           # 路由配置 (含 ProtectedRoute)
│   │   ├── api/                 # API 请求层
│   │   │   ├── client.ts        # Axios 实例 + 拦截器
│   │   │   ├── auth.ts          # 认证 API
│   │   │   └── metrics.ts       # 指标 API
│   │   ├── stores/              # Zustand 状态管理
│   │   │   └── auth.ts          # 认证状态 (persist)
│   │   ├── hooks/               # 自定义 Hooks
│   │   │   ├── useAuth.ts       # 登录/初始化逻辑
│   │   │   └── useFilters.ts    # 筛选状态 (Zustand)
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx   # 主布局 (侧边栏 + 顶栏 + FilterBar)
│   │   ├── components/          # 通用组件
│   │   │   ├── ChartCard.tsx    # 图表卡片 (含 Loading/Error/Empty 状态)
│   │   │   ├── KPICard.tsx      # KPI 指标卡片
│   │   │   ├── FilterBar.tsx    # 全局筛选栏
│   │   │   ├── DimensionTabs.tsx# 维度切换
│   │   │   └── MetricTable.tsx  # 指标表格
│   │   └── pages/               # 页面组件
│   │       ├── Login.tsx
│   │       ├── Overview.tsx
│   │       ├── Adoption.tsx
│   │       ├── Usage.tsx
│   │       ├── Value.tsx
│   │       ├── Cost.tsx
│   │       ├── Errors.tsx
│   │       ├── Channels.tsx
│   │       ├── Health.tsx
│   │       └── Growth.tsx
│   ├── index.html
│   ├── vite.config.ts           # 构建输出 → backend/static/
│   ├── tsconfig.json
│   └── package.json
├── docs/
│   ├── api-reference.md
│   └── database-schema.md
├── CONTRIBUTING.md
├── AGENTS.md
└── README.md
```

## API 概览

所有 API 均支持统一的筛选参数: `start_date`, `end_date`, `granularity`, `user_ids`, `channel_ids`, `model_ids`。

| 路由前缀 | 说明 |
|---------|------|
| `/api/auth` | 认证 (login / init / me) |
| `/api/overview` | 概览 KPI |
| `/api/adoption` | 推广覆盖度 |
| `/api/usage` | 深度使用 |
| `/api/value` | 产出与价值 |
| `/api/cost` | 成本分析 |
| `/api/errors` | 错误分析 |
| `/api/channels` | 多渠道对比 |
| `/api/health` | 系统健康度 |
| `/api/growth` | 增长趋势 |
| `/api/meta` | 元数据 (用户/渠道/模型列表) |

## 数据库设计

核心表包括:
- **usage_logs**: 核心使用记录 (model_id, channel_id, api_key_id, token 用量, 费用)
- **requests**: 请求详情 (status, latency)
- **api_keys**: API Key → 用户映射
- **channels**: 渠道配置
- **projects**: 项目信息
- **admin_users**: 管理员账号

## 开发指南

### 添加新指标
1. 在 `backend/app/models/` 定义 Pydantic 模型
2. 在 `backend/app/services/` 实现查询逻辑
3. 在 `backend/app/routers/` 注册路由
4. 在 `frontend/src/api/metrics.ts` 添加 API 调用
5. 在 `frontend/src/pages/` 创建/更新页面组件
