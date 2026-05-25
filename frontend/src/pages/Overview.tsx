import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line, Pie } from '@ant-design/charts'
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
            description="当日平台收到的总 API 请求次数，反映平台当前的使用活跃度"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="日活跃用户"
            value={kpi?.dau ?? 0}
            suffix="users"
            precision={0}
            loading={kpiLoading}
            description="当日至少发起一次 API 请求的唯一用户数（按 employee_id 去重），衡量用户覆盖广度"
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
            description="近 30 天请求完成率（非 failed/canceled），反映平台整体稳定性"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="今日花费"
            value={kpi?.today_cost ?? 0}
            prefix="$"
            precision={4}
            loading={kpiLoading}
            description="当日所有请求的总费用，基于 Token 消耗 × 模型单价计算，反映平台运营成本"
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
            description="每日请求量的时间序列变化，用于观察使用量的增长趋势和周期性波动"
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
            description="每日 Prompt 和 Completion Token 消耗量变化，区分输入和输出 Token，了解模型算力消耗分布"
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
            description="各模型请求量的占比分布，反映用户对不同模型的选择偏好"
          >
            <Pie
              data={modelDist}
              angleField="request_count"
              colorField="model_id"
              color={CHART_COLORS}
              label={{ text: 'percentage', style: { fontSize: 10 } }}
              legend={{ color: { title: false, position: 'right', row: 5 } }}
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
            description="每日请求错误率的趋势变化，用于监控平台稳定性，及时发现异常波动"
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
