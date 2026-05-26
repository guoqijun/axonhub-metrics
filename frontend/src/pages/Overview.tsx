import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line } from '@ant-design/charts'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import { useFilterStore } from '../hooks/useFilters'
import { CHART_COLORS, CHART_PRIMARY } from '../config/chartTheme'
import {
  fetchOverviewKPI, fetchRequestsTrend, fetchTokenTrend,
  fetchModelDistribution, fetchErrorTrend,
  type OverviewKPI, type TrendPoint, type TokenTrendPoint,
  type ModelDistItem, type ErrorTrendPoint,
} from '../api/metrics'

export default function Overview() {
  const filters = useFilterStore()

  const [kpi, setKpi] = useState<OverviewKPI | null>(null)
  const [kpiLoading, setKpiLoading] = useState(false)

  const [requestsTrend, setRequestsTrend] = useState<TrendPoint[]>([])
  const [requestsTrendLoading, setRequestsTrendLoading] = useState(false)
  const [requestsTrendError, setRequestsTrendError] = useState<string | null>(null)

  const [tokenTrend, setTokenTrend] = useState<TokenTrendPoint[]>([])
  const [tokenTrendLoading, setTokenTrendLoading] = useState(false)
  const [tokenTrendError, setTokenTrendError] = useState<string | null>(null)

  const [modelDist, setModelDist] = useState<ModelDistItem[]>([])
  const [modelDistLoading, setModelDistLoading] = useState(false)
  const [modelDistError, setModelDistError] = useState<string | null>(null)

  const [errorTrend, setErrorTrend] = useState<ErrorTrendPoint[]>([])
  const [errorTrendLoading, setErrorTrendLoading] = useState(false)
  const [errorTrendError, setErrorTrendError] = useState<string | null>(null)

  const loadKPI = useCallback(async () => {
    setKpiLoading(true)
    try {
      const data = await fetchOverviewKPI(filters)
      setKpi(data)
    } catch {
      // KPI errors are silent (cards show 0)
    } finally {
      setKpiLoading(false)
    }
  }, [filters])

  const loadRequestsTrend = useCallback(async () => {
    setRequestsTrendLoading(true)
    setRequestsTrendError(null)
    try {
      const data = await fetchRequestsTrend(filters)
      setRequestsTrend(data)
    } catch (e: any) {
      setRequestsTrendError(e.message)
    } finally {
      setRequestsTrendLoading(false)
    }
  }, [filters])

  const loadTokenTrend = useCallback(async () => {
    setTokenTrendLoading(true)
    setTokenTrendError(null)
    try {
      const data = await fetchTokenTrend(filters)
      setTokenTrend(data)
    } catch (e: any) {
      setTokenTrendError(e.message)
    } finally {
      setTokenTrendLoading(false)
    }
  }, [filters])

  const loadModelDist = useCallback(async () => {
    setModelDistLoading(true)
    setModelDistError(null)
    try {
      const data = await fetchModelDistribution(filters)
      setModelDist(data)
    } catch (e: any) {
      setModelDistError(e.message)
    } finally {
      setModelDistLoading(false)
    }
  }, [filters])

  const loadErrorTrend = useCallback(async () => {
    setErrorTrendLoading(true)
    setErrorTrendError(null)
    try {
      const data = await fetchErrorTrend(filters)
      setErrorTrend(data)
    } catch (e: any) {
      setErrorTrendError(e.message)
    } finally {
      setErrorTrendLoading(false)
    }
  }, [filters])

  useEffect(() => { loadKPI() }, [loadKPI])
  useEffect(() => { loadRequestsTrend() }, [loadRequestsTrend])
  useEffect(() => { loadTokenTrend() }, [loadTokenTrend])
  useEffect(() => { loadModelDist() }, [loadModelDist])
  useEffect(() => { loadErrorTrend() }, [loadErrorTrend])

  const modelPieData = modelDist.map(d => ({ type: d.model_id, value: d.request_count }))

  return (
    <Flex vertical gap={16}>
      {/* KPI Cards Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="今日请求量"
            value={kpi?.today_requests ?? 0}
            suffix="req"
            precision={0}
            loading={kpiLoading}
            description={<><b>指标含义：</b>当日平台收到的所有 API 请求的总次数<br /><b>业务意义：</b>反映平台整体活跃度和使用规模，是核心业务量指标<br /><b>计算逻辑：</b>COUNT(usage_logs)，按 created_at 筛选当日记录，排除非 API 调用记录<br /><b>补充说明：</b>建议结合日环比观察趋势变化，环比增长说明平台处于上升期</>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="日活跃用户"
            value={kpi?.dau ?? 0}
            suffix="users"
            precision={0}
            loading={kpiLoading}
            description={<><b>指标含义：</b>当日至少成功发起一次 API 请求的去重用户数，按 employee_id 去重<br /><b>业务意义：</b>衡量平台的用户覆盖广度和日活规模，反映用户基础的真实活跃情况<br /><b>计算逻辑：</b>COUNT(DISTINCT employee_id)，筛选当日有请求记录的用户<br /><b>补充说明：</b>注意区分注册用户和活跃用户，活跃用户更能反映平台的实际使用情况</>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="成功率"
            value={kpi ? (kpi.success_rate * 100).toFixed(2) : 0}
            suffix="%"
            precision={2}
            trend={kpi && kpi.success_rate > 0.95 ? 'up' : kpi ? 'down' : null}
            trendValue={kpi ? `${(kpi.success_rate * 100).toFixed(1)}%` : undefined}
            loading={kpiLoading}
            description={<><b>指标含义：</b>近 30 天内状态非 failed 或 canceled 的请求占总请求的比例<br /><b>业务意义：</b>衡量平台整体稳定性和服务质量，是 SLA 的核心指标<br /><b>计算逻辑：</b>成功请求数 ÷ 总请求数 × 100%，成功定义为 status 不为 failed/canceled<br /><b>补充说明：</b>建议目标值设置在 99.9% 以上，低于 99% 需要关注</>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="今日花费"
            value={kpi?.today_cost ?? 0}
            prefix="$"
            precision={4}
            loading={kpiLoading}
            description={<><b>指标含义：</b>当日所有 API 请求产生的总费用，基于 Token 消耗 × 各模型单价计算<br /><b>业务意义：</b>反映平台的运营成本和商业价值，辅助预算管理和成本控制<br /><b>计算逻辑：</b>SUM(usage_logs.total_cost)，由各记录的 Token 用量 × 模型单价汇总<br /><b>补充说明：</b>费用受模型选择影响较大，建议结合模型分布分析成本构成</>}
          />
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="请求量趋势"
            loading={requestsTrendLoading}
            error={requestsTrendError}
            empty={requestsTrend.length === 0 && !requestsTrendLoading && !requestsTrendError}
            onRetry={loadRequestsTrend}
            description={<><b>指标含义：</b>每日总请求量在时间轴上的变化曲线<br /><b>业务意义：</b>识别使用量的增长趋势、周期性波动和异常峰值，辅助容量规划<br /><b>计算逻辑：</b>按日期 GROUP BY，COUNT(*) 每日请求总数，按时间升序排列<br /><b>补充说明：</b>建议结合工作日/节假日维度分析，通常工作日使用量更高</>}
          >
            <Column
              data={requestsTrend}
              xField="date"
              yField="value"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Date' }, y: { title: 'Requests' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Token 消耗趋势"
            loading={tokenTrendLoading}
            error={tokenTrendError}
            empty={tokenTrend.length === 0 && !tokenTrendLoading && !tokenTrendError}
            onRetry={loadTokenTrend}
            description={<><b>指标含义：</b>每日 Prompt Token（输入）和 Completion Token（输出）的消耗量变化<br /><b>业务意义：</b>区分输入和输出的 Token 消耗，了解算力资源分配和模型使用模式<br /><b>计算逻辑：</b>按日期和 Token 类型（prompt/completion）分组汇总 SUM(token_count)<br /><b>补充说明：</b>Prompt Token 反映输入数据量，Completion Token 反映模型生成量，两者比例可评估使用场景</>}
          >
            <Line
              data={tokenTrend.flatMap((d) => [
                { date: d.date, type: 'Prompt', tokens: d.prompt_tokens },
                { date: d.date, type: 'Completion', tokens: d.completion_tokens },
              ])}
              xField="date"
              yField="tokens"
              colorField="type"
              color={CHART_COLORS}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="模型分布"
            loading={modelDistLoading}
            error={modelDistError}
            empty={modelDist.length === 0 && !modelDistLoading && !modelDistError}
            onRetry={loadModelDist}
            description={<><b>指标含义：</b>各 AI 模型在总请求量中的占比分布<br /><b>业务意义：</b>了解用户对不同模型的选择偏好，指导模型选型决策和资源采购<br /><b>计算逻辑：</b>按 model_id 分组 COUNT(*)，计算各模型占比 = 模型请求数 ÷ 总请求数 × 100%<br /><b>补充说明：</b>结合费用数据可评估各模型的 ROI，低成本高性能模型应优先推广</>}
          >
            <Column
              data={modelPieData}
              xField="type"
              yField="value"
              color={CHART_PRIMARY}
              axis={{ x: { title: '模型', labelAutoHide: true }, y: { title: '请求数' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="错误率趋势"
            loading={errorTrendLoading}
            error={errorTrendError}
            empty={errorTrend.length === 0 && !errorTrendLoading && !errorTrendError}
            onRetry={loadErrorTrend}
            description={<><b>指标含义：</b>每日请求中发生错误的比率随时间的变化趋势<br /><b>业务意义：</b>监控平台稳定性，及时发现异常波动，定位故障时间点<br /><b>计算逻辑：</b>SUM(failed_count) ÷ COUNT(*) × 100%，每日汇总计算。支持按状态码细分<br /><b>补充说明：</b>错误率突增通常由上游 AI 供应商故障、网络问题或配额耗尽引起</>}
          >
            <Line
              data={errorTrend}
              xField="date"
              yField="error_rate"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Date' }, y: { title: 'Error Rate (%)' } }}
            />
          </ChartCard>
        </Col>
      </Row>
    </Flex>
  )
}
