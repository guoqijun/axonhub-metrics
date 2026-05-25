import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line, Pie } from '@ant-design/charts'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import { useFilterStore } from '../hooks/useFilters'
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
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="日活跃用户"
            value={kpi?.dau ?? 0}
            suffix="users"
            precision={0}
            loading={kpiLoading}
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
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="今日花费"
            value={kpi?.today_cost ?? 0}
            prefix="$"
            precision={4}
            loading={kpiLoading}
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
          >
            <Column
              data={requestsTrend}
              xField="date"
              yField="value"
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
          >
            <Line
              data={tokenTrend.flatMap((d) => [
                { date: d.date, type: 'Prompt', tokens: d.prompt_tokens },
                { date: d.date, type: 'Completion', tokens: d.completion_tokens },
              ])}
              xField="date"
              yField="tokens"
              colorField="type"
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
          >
            <Pie
              data={modelDist}
              angleField="request_count"
              colorField="model_id"
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
          >
            <Line
              data={errorTrend}
              xField="date"
              yField="error_rate"
              axis={{ x: { title: 'Date' }, y: { title: 'Error Rate (%)' } }}
            />
          </ChartCard>
        </Col>
      </Row>
    </Flex>
  )
}
