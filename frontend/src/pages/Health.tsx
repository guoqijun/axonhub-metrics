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
            description={<><b>指标含义：</b>P50（中位数）、P95（第 95 百分位）、P99（第 99 百分位）延迟的时间序列趋势<br /><b>业务意义：</b>全面评估系统响应性能。P50 反映典型体验，P99 反映最差情况（尾部延迟），P99 过高说明存在严重性能问题<br /><b>计算逻辑：</b>按日期分组，对 latency_ms 排序后取对应百分位的值。P50 = 中位数，P95 = 排序后第 95% 位置的值<br /><b>补充说明：</b>P99 延迟通常是 P50 的 5-10 倍，若超过 10 倍说明尾部延迟问题严重，需要排查慢请求原因</>}
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
            description={<><b>指标含义：</b>各 AI 供应商渠道的综合健康评分排名，基于延迟、错误率等指标加权计算<br /><b>业务意义：</b>快速识别需要关注的渠道，辅助流量调度和供应商管理决策<br /><b>计算逻辑：</b>综合评分由延迟评分 + 错误率评分 + 可用性评分加权汇总，满分 100 分。分数越高渠道越健康<br /><b>补充说明：</b>建议对低于 85 分的渠道设置告警，低于 70 分的渠道自动切换流量到备用渠道</>}
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
            description={<><b>指标含义：</b>筛选时间段内延迟最高的前 50 个请求的详细信息，包括模型、渠道、延迟时长、状态和发生时间<br /><b>业务意义：</b>定位性能瓶颈，排查慢请求原因（是特定模型/渠道还是特定时段），为性能优化提供具体案例<br /><b>计算逻辑：</b>按 latency_ms 降序排列，LIMIT 50。展示每条慢请求的完整上下文信息<br /><b>补充说明：</b>慢请求可能是由大模型处理复杂任务导致，也可能是网络波动或上游服务性能下降。建议关注慢请求的分布模式</>}
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
            description={<><b>指标含义：</b>各 AI 供应商渠道的当前配额使用状态（正常/exhausted/resetting）和下次重置时间<br /><b>业务意义：</b>提前防范因配额耗尽导致的服务中断，确保核心渠道始终可用<br /><b>计算逻辑：</b>读取各渠道配额使用量和上限，状态判断：使用量/上限 &lt; 80% 正常，&gt; 80% 警告，100% exhausted<br /><b>补充说明：</b>配额管理是保障服务连续性的关键，建议设置多级预警机制。考虑为关键业务配置多个渠道实现自动故障转移</>}
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
            description={<><b>指标含义：</b>探针（Probe）监控系统采集的每秒 Token 处理量（TPS, Tokens Per Second）和首 Token 延迟（TTFT, Time To First Token）的趋势<br /><b>业务意义：</b>主动探测 AI 服务性能，获取无偏见的性能数据。TPS 反映处理吞吐能力，TTFT 反映响应速度<br /><b>计算逻辑：</b>TPS = 每次请求的 Token 数 ÷ 耗时（秒），TTFT = 从请求发出到收到第一个 Token 的时间。按日期聚合取平均值<br /><b>补充说明：</b>探针使用标准化请求进行测量，排除了用户端差异，能更真实地反映上游服务的实际性能状况</>}
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
            description={<><b>指标含义：</b>每日缓存命中率的时间序列变化，缓存命中 = 请求结果直接从缓存返回未调用上游 API<br /><b>业务意义：</b>缓存命中率越高说明重复查询越多，缓存策略越有效。高命中率可显著降低延迟和节省 API 调用费用<br /><b>计算逻辑：</b>COUNT(cache_hit=true) ÷ COUNT(*) × 100%，按日期分组计算每日命中率<br /><b>补充说明：</b>语义缓存对相同或相似输入生效，命中率受业务场景影响。建议对高频重复查询（如常用问答）优化缓存策略</>}
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
            description={<><b>指标含义：</b>每日服务可用性百分比（Availability %）的时间序列，反映平台的 SLA 达标情况<br /><b>业务意义：</b>直观展示服务可用性变化，监控 SLA 达标情况。可用性低于 99.9% 需要重点关注<br /><b>计算逻辑：</b>（1 - 失败请求数 / 总请求数）× 100%，按日计算。失败包括 timeout、5xx 等服务器端错误<br /><b>补充说明：</b>SLA 通常以月为单位计算（99.9% = 月故障时间不超过 43 分钟）。建议区分上游故障和平台自身故障</>}
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
