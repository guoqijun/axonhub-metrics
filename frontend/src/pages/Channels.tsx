import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex, Tag } from 'antd'
import { Column, Line } from '@ant-design/charts'
import ChartCard from '../components/ChartCard'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
import { CHART_COLORS, CHART_PRIMARY } from '../config/chartTheme'
import {
  fetchChannelComparisonTable, fetchChannelLatencyComparison,
  fetchChannelLatencyHeatmap, fetchChannelHealthScores,
  fetchChannelErrorTrendOverlay, fetchChannelQuotaStatus,
  fetchChannelPriceComparison,
  type ChannelComparison, type ChannelLatency,
  type ChannelLatencyHeatmapPoint, type ChannelHealth,
  type ChannelErrorTrendPoint, type QuotaStatus,
  type ChannelPricePoint,
} from '../api/metrics'

export default function Channels() {
  const filters = useFilterStore()

  const [comparison, setComparison] = useState<ChannelComparison[]>([])
  const [comparisonLoading, setComparisonLoading] = useState(false)
  const [comparisonError, setComparisonError] = useState<string | null>(null)

  const [latencyComp, setLatencyComp] = useState<ChannelLatency[]>([])
  const [latencyCompLoading, setLatencyCompLoading] = useState(false)
  const [latencyCompError, setLatencyCompError] = useState<string | null>(null)

  const [latencyHeatmap, setLatencyHeatmap] = useState<ChannelLatencyHeatmapPoint[]>([])
  const [latencyHeatmapLoading, setLatencyHeatmapLoading] = useState(false)
  const [latencyHeatmapError, setLatencyHeatmapError] = useState<string | null>(null)

  const [health, setHealth] = useState<ChannelHealth[]>([])
  const [healthLoading, setHealthLoading] = useState(false)
  const [healthError, setHealthError] = useState<string | null>(null)

  const [errorTrend, setErrorTrend] = useState<ChannelErrorTrendPoint[]>([])
  const [errorTrendLoading, setErrorTrendLoading] = useState(false)
  const [errorTrendError, setErrorTrendError] = useState<string | null>(null)

  const [quota, setQuota] = useState<QuotaStatus[]>([])
  const [quotaLoading, setQuotaLoading] = useState(false)
  const [quotaError, setQuotaError] = useState<string | null>(null)

  const [price, setPrice] = useState<ChannelPricePoint[]>([])
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceError, setPriceError] = useState<string | null>(null)

  const loadComparison = useCallback(async () => {
    setComparisonLoading(true); setComparisonError(null)
    try { setComparison(await fetchChannelComparisonTable(filters)) }
    catch (e: any) { setComparisonError(e.message) }
    finally { setComparisonLoading(false) }
  }, [filters])

  const loadLatencyComp = useCallback(async () => {
    setLatencyCompLoading(true); setLatencyCompError(null)
    try { setLatencyComp(await fetchChannelLatencyComparison(filters)) }
    catch (e: any) { setLatencyCompError(e.message) }
    finally { setLatencyCompLoading(false) }
  }, [filters])

  const loadLatencyHeatmap = useCallback(async () => {
    setLatencyHeatmapLoading(true); setLatencyHeatmapError(null)
    try { setLatencyHeatmap(await fetchChannelLatencyHeatmap(filters)) }
    catch (e: any) { setLatencyHeatmapError(e.message) }
    finally { setLatencyHeatmapLoading(false) }
  }, [filters])

  const loadHealth = useCallback(async () => {
    setHealthLoading(true); setHealthError(null)
    try { setHealth(await fetchChannelHealthScores(filters)) }
    catch (e: any) { setHealthError(e.message) }
    finally { setHealthLoading(false) }
  }, [filters])

  const loadErrorTrend = useCallback(async () => {
    setErrorTrendLoading(true); setErrorTrendError(null)
    try { setErrorTrend(await fetchChannelErrorTrendOverlay(filters)) }
    catch (e: any) { setErrorTrendError(e.message) }
    finally { setErrorTrendLoading(false) }
  }, [filters])

  const loadQuota = useCallback(async () => {
    setQuotaLoading(true); setQuotaError(null)
    try { setQuota(await fetchChannelQuotaStatus(filters)) }
    catch (e: any) { setQuotaError(e.message) }
    finally { setQuotaLoading(false) }
  }, [filters])

  const loadPrice = useCallback(async () => {
    setPriceLoading(true); setPriceError(null)
    try { setPrice(await fetchChannelPriceComparison(filters)) }
    catch (e: any) { setPriceError(e.message) }
    finally { setPriceLoading(false) }
  }, [filters])

  useEffect(() => { loadComparison() }, [loadComparison])
  useEffect(() => { loadLatencyComp() }, [loadLatencyComp])
  useEffect(() => { loadLatencyHeatmap() }, [loadLatencyHeatmap])
  useEffect(() => { loadHealth() }, [loadHealth])
  useEffect(() => { loadErrorTrend() }, [loadErrorTrend])
  useEffect(() => { loadQuota() }, [loadQuota])
  useEffect(() => { loadPrice() }, [loadPrice])

  // Transform error trend for multi-line chart
  const errorTrendLines = errorTrend.map(e => ({
    date: e.date,
    error_rate: e.error_rate,
    channel: e.channel_name || `#${e.channel_id}`,
  }))

  return (
    <Flex vertical gap={16}>
      {/* Row 1: Comparison table + latency comparison */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="渠道综合对比"
            loading={comparisonLoading}
            error={comparisonError}
            empty={comparison.length === 0 && !comparisonLoading && !comparisonError}
            onRetry={loadComparison}
            description="渠道多维度对比（请求量、用户数、延迟、费用、错误率），综合评估各 AI 供应商渠道表现"
          >
            <MetricTable
              dataSource={comparison}
              rowKey="channel_id"
              columns={[
                { key: 'channel_name', title: '渠道' },
                { key: 'channel_type', title: '类型' },
                { key: 'request_count', title: '请求数' },
                { key: 'user_count', title: '用户数' },
                { key: 'avg_latency', title: '平均延迟', render: (r: ChannelComparison) => `${r.avg_latency.toFixed(0)}ms` },
                { key: 'total_cost', title: '总费用', render: (r: ChannelComparison) => `$${r.total_cost.toFixed(4)}` },
                { key: 'error_rate', title: '错误率', render: (r: ChannelComparison) => `${r.error_rate}%` },
              ]}
              loading={comparisonLoading}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="延迟对比"
            loading={latencyCompLoading}
            error={latencyCompError}
            empty={latencyComp.length === 0 && !latencyCompLoading && !latencyCompError}
            onRetry={loadLatencyComp}
            description="各渠道的平均延迟和最大延迟对比，评估 AI 供应商的响应性能"
          >
            <Column
              data={latencyComp.flatMap(l => [
                { channel: l.channel_name, type: '平均延迟', value: l.avg_latency },
                { channel: l.channel_name, type: '最大延迟', value: l.max_latency },
              ])}
              xField="channel"
              yField="value"
              colorField="type"
              color={CHART_COLORS}
              axis={{ x: { title: 'Channel', labelAutoHide: true }, y: { title: 'Latency (ms)' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 2: Latency heatmap + health scores */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="延迟热力图 (渠道 × 时段)"
            loading={latencyHeatmapLoading}
            error={latencyHeatmapError}
            empty={latencyHeatmap.length === 0 && !latencyHeatmapLoading && !latencyHeatmapError}
            onRetry={loadLatencyHeatmap}
            description="不同时段各渠道的平均延迟变化（渠道 × 小时交叉分析），发现高峰期性能瓶颈"
          >
            <Column
              data={latencyHeatmap}
              xField="hour"
              yField="avg_latency"
              colorField="channel_name"
              color={CHART_COLORS}
              axis={{ x: { title: 'Hour' }, y: { title: 'Avg Latency (ms)' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="渠道健康分"
            loading={healthLoading}
            error={healthError}
            empty={health.length === 0 && !healthLoading && !healthError}
            onRetry={loadHealth}
            description="各渠道的综合健康评分（基于延迟、错误率等多维指标），快速识别需要关注的渠道"
          >
            <Column
              data={health}
              xField="channel_name"
              yField="health_score"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Channel' }, y: { title: 'Health Score' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 3: Error trend overlay + quota status */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="错误率趋势 (分渠道)"
            loading={errorTrendLoading}
            error={errorTrendError}
            empty={errorTrendLines.length === 0 && !errorTrendLoading && !errorTrendError}
            onRetry={loadErrorTrend}
            description="各渠道错误率的时间序列变化，监控不同 AI 供应商的稳定性波动"
          >
            <Line
              data={errorTrendLines}
              xField="date"
              yField="error_rate"
              colorField="channel"
              color={CHART_COLORS}
              axis={{ x: { title: 'Date' }, y: { title: 'Error Rate %' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Quota 状态"
            loading={quotaLoading}
            error={quotaError}
            empty={quota.length === 0 && !quotaLoading && !quotaError}
            onRetry={loadQuota}
            description="各渠道的配额使用状态和重置时间，监控渠道可用性，提前防范服务中断"
          >
            <MetricTable
              dataSource={quota}
              rowKey="channel_id"
              columns={[
                { key: 'channel_name', title: '渠道' },
                { key: 'provider_type', title: 'Provider' },
                {
                  key: 'status', title: '状态',
                  render: (r: QuotaStatus) => (
                    <Tag color={r.status === 'active' ? 'green' : r.status === 'exhausted' ? 'red' : 'orange'}>{r.status}</Tag>
                  ),
                },
                {
                  key: 'ready', title: '可用',
                  render: (r: QuotaStatus) => (r.ready ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>),
                },
                { key: 'next_reset_at', title: '下次重置' },
              ]}
              loading={quotaLoading}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 4: Price comparison */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <ChartCard
            title="价格对比 (每 Token 平均成本)"
            loading={priceLoading}
            error={priceError}
            empty={price.length === 0 && !priceLoading && !priceError}
            onRetry={loadPrice}
            description="各渠道按模型的每 Token 平均成本对比，辅助成本优化和渠道选择决策"
          >
            <MetricTable
              dataSource={price}
              rowKey={(r: ChannelPricePoint) => `${r.channel_id}-${r.model_id}`}
              columns={[
                { key: 'channel_name', title: '渠道' },
                { key: 'model_id', title: '模型' },
                { key: 'avg_cost_per_token', title: '平均成本/Token', render: (r: ChannelPricePoint) => `$${r.avg_cost_per_token.toFixed(8)}` },
                { key: 'request_count', title: '请求数' },
              ]}
              loading={priceLoading}
            />
          </ChartCard>
        </Col>
      </Row>
    </Flex>
  )
}
