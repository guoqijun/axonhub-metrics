import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line } from '@ant-design/charts'
import ChartCard from '../components/ChartCard'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
import {
  fetchTokenFeeTrend, fetchCostModelDistribution, fetchChannelComparison,
  fetchCostUserTop, fetchProjectDailyCost, fetchCacheHitRate,
  fetchReasoningRatio, fetchForecast,
  type TokenFeeTrendPoint, type CostModelDist, type ChannelCostComparison,
  type CostTopUser, type ProjectDailyCost, type CacheHitRatePoint,
  type ReasoningRatioPoint, type ForecastPoint,
} from '../api/metrics'

export default function Cost() {
  const filters = useFilterStore()

  const [tokenFee, setTokenFee] = useState<TokenFeeTrendPoint[]>([])
  const [tokenFeeLoading, setTokenFeeLoading] = useState(false)
  const [tokenFeeError, setTokenFeeError] = useState<string | null>(null)

  const [modelDist, setModelDist] = useState<CostModelDist[]>([])
  const [modelDistLoading, setModelDistLoading] = useState(false)
  const [modelDistError, setModelDistError] = useState<string | null>(null)

  const [channelComp, setChannelComp] = useState<ChannelCostComparison[]>([])
  const [channelCompLoading, setChannelCompLoading] = useState(false)
  const [channelCompError, setChannelCompError] = useState<string | null>(null)

  const [userTop, setUserTop] = useState<CostTopUser[]>([])
  const [userTopLoading, setUserTopLoading] = useState(false)
  const [userTopError, setUserTopError] = useState<string | null>(null)

  const [projectDaily, setProjectDaily] = useState<ProjectDailyCost[]>([])
  const [projectDailyLoading, setProjectDailyLoading] = useState(false)
  const [projectDailyError, setProjectDailyError] = useState<string | null>(null)

  const [cacheHit, setCacheHit] = useState<CacheHitRatePoint[]>([])
  const [cacheHitLoading, setCacheHitLoading] = useState(false)
  const [cacheHitError, setCacheHitError] = useState<string | null>(null)

  const [reasoning, setReasoning] = useState<ReasoningRatioPoint[]>([])
  const [reasoningLoading, setReasoningLoading] = useState(false)
  const [reasoningError, setReasoningError] = useState<string | null>(null)

  const [forecast, setForecast] = useState<ForecastPoint[]>([])
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState<string | null>(null)

  const loadTokenFee = useCallback(async () => {
    setTokenFeeLoading(true); setTokenFeeError(null)
    try { setTokenFee(await fetchTokenFeeTrend(filters)) }
    catch (e: any) { setTokenFeeError(e.message) }
    finally { setTokenFeeLoading(false) }
  }, [filters])

  const loadModelDist = useCallback(async () => {
    setModelDistLoading(true); setModelDistError(null)
    try { setModelDist(await fetchCostModelDistribution(filters)) }
    catch (e: any) { setModelDistError(e.message) }
    finally { setModelDistLoading(false) }
  }, [filters])

  const loadChannelComp = useCallback(async () => {
    setChannelCompLoading(true); setChannelCompError(null)
    try { setChannelComp(await fetchChannelComparison(filters)) }
    catch (e: any) { setChannelCompError(e.message) }
    finally { setChannelCompLoading(false) }
  }, [filters])

  const loadUserTop = useCallback(async () => {
    setUserTopLoading(true); setUserTopError(null)
    try { setUserTop(await fetchCostUserTop(filters)) }
    catch (e: any) { setUserTopError(e.message) }
    finally { setUserTopLoading(false) }
  }, [filters])

  const loadProjectDaily = useCallback(async () => {
    setProjectDailyLoading(true); setProjectDailyError(null)
    try { setProjectDaily(await fetchProjectDailyCost(filters)) }
    catch (e: any) { setProjectDailyError(e.message) }
    finally { setProjectDailyLoading(false) }
  }, [filters])

  const loadCacheHit = useCallback(async () => {
    setCacheHitLoading(true); setCacheHitError(null)
    try { setCacheHit(await fetchCacheHitRate(filters)) }
    catch (e: any) { setCacheHitError(e.message) }
    finally { setCacheHitLoading(false) }
  }, [filters])

  const loadReasoning = useCallback(async () => {
    setReasoningLoading(true); setReasoningError(null)
    try { setReasoning(await fetchReasoningRatio(filters)) }
    catch (e: any) { setReasoningError(e.message) }
    finally { setReasoningLoading(false) }
  }, [filters])

  const loadForecast = useCallback(async () => {
    setForecastLoading(true); setForecastError(null)
    try { setForecast(await fetchForecast(filters)) }
    catch (e: any) { setForecastError(e.message) }
    finally { setForecastLoading(false) }
  }, [filters])

  useEffect(() => { loadTokenFee() }, [loadTokenFee])
  useEffect(() => { loadModelDist() }, [loadModelDist])
  useEffect(() => { loadChannelComp() }, [loadChannelComp])
  useEffect(() => { loadUserTop() }, [loadUserTop])
  useEffect(() => { loadProjectDaily() }, [loadProjectDaily])
  useEffect(() => { loadCacheHit() }, [loadCacheHit])
  useEffect(() => { loadReasoning() }, [loadReasoning])
  useEffect(() => { loadForecast() }, [loadForecast])

  // Forecast chart data: two series
  const forecastActual = forecast.filter(f => f.actual !== null).map(f => ({ date: f.date, value: f.actual!, type: '实际' }))
  const forecastPred = forecast.filter(f => f.forecast !== null).map(f => ({ date: f.date, value: f.forecast!, type: '预测' }))

  return (
    <Flex vertical gap={16}>
      {/* Row 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Token + 费用趋势"
            loading={tokenFeeLoading}
            error={tokenFeeError}
            empty={tokenFee.length === 0 && !tokenFeeLoading && !tokenFeeError}
            onRetry={loadTokenFee}
          >
            <Line
              data={tokenFee.flatMap(d => [
                { date: d.date, type: 'Prompt Tokens', value: d.prompt_tokens },
                { date: d.date, type: 'Completion Tokens', value: d.completion_tokens },
              ])}
              xField="date"
              yField="value"
              colorField="type"
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="模型成本分布"
            loading={modelDistLoading}
            error={modelDistError}
            empty={modelDist.length === 0 && !modelDistLoading && !modelDistError}
            onRetry={loadModelDist}
          >
            <Column
              data={modelDist}
              xField="model_id"
              yField="total_cost"
              axis={{ x: { title: 'Model', labelAutoHide: true }, y: { title: 'Cost ($)' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 2 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="渠道成本对比"
            loading={channelCompLoading}
            error={channelCompError}
            empty={channelComp.length === 0 && !channelCompLoading && !channelCompError}
            onRetry={loadChannelComp}
          >
            <Column
              data={channelComp}
              xField="channel_name"
              yField="total_cost"
              axis={{ x: { title: 'Channel' }, y: { title: 'Cost ($)' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="成本 Top 用户"
            loading={userTopLoading}
            error={userTopError}
            empty={userTop.length === 0 && !userTopLoading && !userTopError}
            onRetry={loadUserTop}
          >
            <MetricTable
              dataSource={userTop}
              rowKey="user_id"
              columns={[
                { key: 'name', title: '用户', render: (r: CostTopUser) => r.name || r.email || `#${r.user_id}` },
                { key: 'total_cost', title: '总费用', render: (r: CostTopUser) => `$${r.total_cost.toFixed(4)}` },
                { key: 'request_count', title: '请求数' },
                { key: 'total_tokens', title: 'Token 数', render: (r: CostTopUser) => r.total_tokens.toLocaleString() },
              ]}
              loading={userTopLoading}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 3 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="项目日花费"
            loading={projectDailyLoading}
            error={projectDailyError}
            empty={projectDaily.length === 0 && !projectDailyLoading && !projectDailyError}
            onRetry={loadProjectDaily}
          >
            <Line
              data={projectDaily.map(p => ({
                date: p.date, value: p.total_cost, project: p.project_name || `#${p.project_id}`,
              }))}
              xField="date"
              yField="value"
              colorField="project"
              axis={{ x: { title: 'Date' }, y: { title: 'Cost ($)' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="缓存命中率"
            loading={cacheHitLoading}
            error={cacheHitError}
            empty={cacheHit.length === 0 && !cacheHitLoading && !cacheHitError}
            onRetry={loadCacheHit}
          >
            <Line
              data={cacheHit}
              xField="date"
              yField="cache_hit_pct"
              axis={{ x: { title: 'Date' }, y: { title: 'Cache Hit %' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 4 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="推理 Token 占比"
            loading={reasoningLoading}
            error={reasoningError}
            empty={reasoning.length === 0 && !reasoningLoading && !reasoningError}
            onRetry={loadReasoning}
          >
            <Line
              data={reasoning}
              xField="date"
              yField="reasoning_pct"
              axis={{ x: { title: 'Date' }, y: { title: 'Reasoning %' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="成本预测"
            loading={forecastLoading}
            error={forecastError}
            empty={forecastActual.length === 0 && !forecastLoading && !forecastError}
            onRetry={loadForecast}
          >
            <Line
              data={[...forecastActual, ...forecastPred]}
              xField="date"
              yField="value"
              colorField="type"
              axis={{ x: { title: 'Date' }, y: { title: 'Cost ($)' } }}
            />
          </ChartCard>
        </Col>
      </Row>
    </Flex>
  )
}
