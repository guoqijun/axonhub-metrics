import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex, Tag } from 'antd'
import { Column, Line } from '@ant-design/charts'
import ChartCard from '../components/ChartCard'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
import { CHART_COLORS, CHART_PRIMARY } from '../config/chartTheme'
import {
  fetchLatencyTrend, fetchChannelHealthRanking, fetchSlowRequests,
  fetchQuotaAlertList, fetchProbeTrend, fetchCacheHitTrend,
  fetchAvailabilityCalendar,
  type LatencyTrendPoint, type ChannelHealthRanking, type SlowRequest,
  type QuotaAlert, type ProbeTrendPoint, type CacheHitTrendPoint,
  type AvailabilityCalendarPoint,
} from '../api/metrics'

export default function Health() {
  const filters = useFilterStore()

  const [latency, setLatency] = useState<LatencyTrendPoint[]>([])
  const [latencyLoading, setLatencyLoading] = useState(false)
  const [latencyError, setLatencyError] = useState<string | null>(null)

  const [healthRank, setHealthRank] = useState<ChannelHealthRanking[]>([])
  const [healthRankLoading, setHealthRankLoading] = useState(false)
  const [healthRankError, setHealthRankError] = useState<string | null>(null)

  const [slowReqs, setSlowReqs] = useState<SlowRequest[]>([])
  const [slowReqsLoading, setSlowReqsLoading] = useState(false)
  const [slowReqsError, setSlowReqsError] = useState<string | null>(null)

  const [quotaAlerts, setQuotaAlerts] = useState<QuotaAlert[]>([])
  const [quotaAlertsLoading, setQuotaAlertsLoading] = useState(false)
  const [quotaAlertsError, setQuotaAlertsError] = useState<string | null>(null)

  const [probe, setProbe] = useState<ProbeTrendPoint[]>([])
  const [probeLoading, setProbeLoading] = useState(false)
  const [probeError, setProbeError] = useState<string | null>(null)

  const [cacheHit, setCacheHit] = useState<CacheHitTrendPoint[]>([])
  const [cacheHitLoading, setCacheHitLoading] = useState(false)
  const [cacheHitError, setCacheHitError] = useState<string | null>(null)

  const [avail, setAvail] = useState<AvailabilityCalendarPoint[]>([])
  const [availLoading, setAvailLoading] = useState(false)
  const [availError, setAvailError] = useState<string | null>(null)

  const loadLatency = useCallback(async () => {
    setLatencyLoading(true); setLatencyError(null)
    try { setLatency(await fetchLatencyTrend(filters)) }
    catch (e: any) { setLatencyError(e.message) }
    finally { setLatencyLoading(false) }
  }, [filters])

  const loadHealthRank = useCallback(async () => {
    setHealthRankLoading(true); setHealthRankError(null)
    try { setHealthRank(await fetchChannelHealthRanking(filters)) }
    catch (e: any) { setHealthRankError(e.message) }
    finally { setHealthRankLoading(false) }
  }, [filters])

  const loadSlowReqs = useCallback(async () => {
    setSlowReqsLoading(true); setSlowReqsError(null)
    try { setSlowReqs(await fetchSlowRequests(filters)) }
    catch (e: any) { setSlowReqsError(e.message) }
    finally { setSlowReqsLoading(false) }
  }, [filters])

  const loadQuotaAlerts = useCallback(async () => {
    setQuotaAlertsLoading(true); setQuotaAlertsError(null)
    try { setQuotaAlerts(await fetchQuotaAlertList(filters)) }
    catch (e: any) { setQuotaAlertsError(e.message) }
    finally { setQuotaAlertsLoading(false) }
  }, [filters])

  const loadProbe = useCallback(async () => {
    setProbeLoading(true); setProbeError(null)
    try { setProbe(await fetchProbeTrend(filters)) }
    catch (e: any) { setProbeError(e.message) }
    finally { setProbeLoading(false) }
  }, [filters])

  const loadCacheHit = useCallback(async () => {
    setCacheHitLoading(true); setCacheHitError(null)
    try { setCacheHit(await fetchCacheHitTrend(filters)) }
    catch (e: any) { setCacheHitError(e.message) }
    finally { setCacheHitLoading(false) }
  }, [filters])

  const loadAvail = useCallback(async () => {
    setAvailLoading(true); setAvailError(null)
    try { setAvail(await fetchAvailabilityCalendar(filters)) }
    catch (e: any) { setAvailError(e.message) }
    finally { setAvailLoading(false) }
  }, [filters])

  useEffect(() => { loadLatency() }, [loadLatency])
  useEffect(() => { loadHealthRank() }, [loadHealthRank])
  useEffect(() => { loadSlowReqs() }, [loadSlowReqs])
  useEffect(() => { loadQuotaAlerts() }, [loadQuotaAlerts])
  useEffect(() => { loadProbe() }, [loadProbe])
  useEffect(() => { loadCacheHit() }, [loadCacheHit])
  useEffect(() => { loadAvail() }, [loadAvail])

  // Latency trend multi-series
  const latencySeries = latency.flatMap(l => [
    { date: l.date, type: 'P50', value: l.p50_latency },
    { date: l.date, type: 'P95', value: l.p95_latency },
    { date: l.date, type: 'P99', value: l.p99_latency },
  ])

  // Probe trend multi-series
  const probeSeries = probe.flatMap(p => [
    { date: p.date, type: 'TPS', value: p.avg_tokens_per_second },
    { date: p.date, type: 'TTFT (ms)', value: p.avg_time_to_first_token_ms },
  ])

  return (
    <Flex vertical gap={16}>
      {/* Row 1: Latency trend + health ranking */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="P50 / P95 / P99 延迟趋势"
            loading={latencyLoading}
            error={latencyError}
            empty={latency.length === 0 && !latencyLoading && !latencyError}
            onRetry={loadLatency}
            description="不同百分位延迟的时间序列趋势（P50/P95/P99），全面评估系统响应性能，P99 反映最差情况"
          >
            <Line
              data={latencySeries}
              xField="date"
              yField="value"
              colorField="type"
              color={CHART_COLORS}
              axis={{ x: { title: 'Date' }, y: { title: 'Latency (ms)' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="渠道健康排名"
            loading={healthRankLoading}
            error={healthRankError}
            empty={healthRank.length === 0 && !healthRankLoading && !healthRankError}
            onRetry={loadHealthRank}
            description="各渠道的综合健康评分排名（基于延迟、错误率等指标），快速识别需要关注的渠道"
          >
            <Column
              data={healthRank}
              xField="channel_name"
              yField="health_score"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Channel' }, y: { title: 'Health Score' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 2: Slow requests + quota alerts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="慢请求 Top 50"
            loading={slowReqsLoading}
            error={slowReqsError}
            empty={slowReqs.length === 0 && !slowReqsLoading && !slowReqsError}
            onRetry={loadSlowReqs}
            description="延迟最高的 Top 50 请求详情（模型、渠道、延迟、状态），用于性能问题排查和优化"
          >
            <MetricTable
              dataSource={slowReqs}
              rowKey="request_id"
              columns={[
                { key: 'model_id', title: '模型' },
                { key: 'channel_name', title: '渠道' },
                { key: 'latency_ms', title: '延迟', render: (r: SlowRequest) => `${(r.latency_ms / 1000).toFixed(1)}s` },
                { key: 'status', title: '状态' },
                { key: 'created_at', title: '时间' },
              ]}
              loading={slowReqsLoading}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="配额预警"
            loading={quotaAlertsLoading}
            error={quotaAlertsError}
            empty={quotaAlerts.length === 0 && !quotaAlertsLoading && !quotaAlertsError}
            onRetry={loadQuotaAlerts}
            description="各渠道的配额状态和预警信息（正常/耗尽/即将重置），提前防范服务中断风险"
          >
            <MetricTable
              dataSource={quotaAlerts}
              rowKey="channel_id"
              columns={[
                { key: 'channel_name', title: '渠道' },
                { key: 'provider_type', title: 'Provider' },
                { key: 'status', title: '状态', render: (r: QuotaAlert) => (
                  <Tag color={r.status === 'exhausted' ? 'red' : 'orange'}>{r.status}</Tag>
                )},
                { key: 'next_reset_at', title: '下次重置' },
              ]}
              loading={quotaAlertsLoading}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 3: Probe trend + cache hit trend */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="探针 TPS / TTFT 趋势"
            loading={probeLoading}
            error={probeError}
            empty={probeSeries.length === 0 && !probeLoading && !probeError}
            onRetry={loadProbe}
            description="探针监控的每秒 Token 处理量（TPS）和首 Token 延迟（TTFT）趋势，主动探测 AI 服务性能"
          >
            <Line
              data={probeSeries}
              xField="date"
              yField="value"
              colorField="type"
              color={CHART_COLORS}
              axis={{ x: { title: 'Date' }, y: { title: 'Value' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="缓存命中趋势"
            loading={cacheHitLoading}
            error={cacheHitError}
            empty={cacheHit.length === 0 && !cacheHitLoading && !cacheHitError}
            onRetry={loadCacheHit}
            description="缓存命中率的时间序列趋势，命中率越高说明缓存策略越有效，可降低延迟和节省成本"
          >
            <Line
              data={cacheHit}
              xField="date"
              yField="cache_hit_pct"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Date' }, y: { title: 'Cache Hit %' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 4: Availability calendar */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <ChartCard
            title="可用性日历"
            loading={availLoading}
            error={availError}
            empty={avail.length === 0 && !availLoading && !availError}
            onRetry={loadAvail}
            description="每日可用性百分比的时间序列，直观展示服务可用性变化，发现 SLA 达标情况"
          >
            <Column
              data={avail}
              xField="date"
              yField="availability_pct"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Date' }, y: { title: 'Availability %' } }}
            />
          </ChartCard>
        </Col>
      </Row>
    </Flex>
  )
}
