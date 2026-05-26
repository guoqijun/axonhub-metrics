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
            description={<><b>指标含义：</b>各 AI 供应商渠道的多维度对比数据，涵盖请求量、用户数、平均延迟、总费用、错误率五大核心指标<br /><b>业务意义：</b>综合评估各渠道表现，辅助渠道权重分配和供应商管理决策，发现优势渠道和问题渠道<br /><b>计算逻辑：</b>按 channel_id 分组聚合：COUNT(*) 请求量、COUNT(DISTINCT employee_id) 用户数、AVG(latency_ms) 延迟、SUM(total_cost) 费用、SUM(error_count)/COUNT(*) 错误率<br /><b>补充说明：</b>建议将流量合理分散到多个渠道，避免单一依赖。结合健康评分可全面评估渠道质量</>}
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
            description={<><b>指标含义：</b>各 AI 供应商渠道的平均延迟（Avg Latency）和最大延迟（Max Latency）的柱状对比<br /><b>业务意义：</b>评估各 AI 供应商的响应性能，选择低延迟渠道提升用户体验。最大延迟反映最差情况<br /><b>计算逻辑：</b>按 channel_id 分组，AVG(latency_ms) 平均延迟、MAX(latency_ms) 最大延迟，按平均延迟升序排列<br /><b>补充说明：</b>延迟受网络状况、模型复杂度和请求负载影响。建议在高峰期和非高峰期分别评估</>}
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
            description={<><b>指标含义：</b>不同时段（小时）各 AI 供应商渠道的平均延迟变化，渠道 × 小时交叉分析<br /><b>业务意义：</b>发现各渠道在一天中的性能波动模式，识别高峰期性能瓶颈，优化流量调度策略<br /><b>计算逻辑：</b>按 channel_id 和 EXTRACT(HOUR FROM created_at) 分组，AVG(latency_ms)<br /><b>补充说明：</b>部分渠道可能在特定时段（如美国白天）因负载高导致延迟上升，可在该时段将流量切换到表现更好的渠道</>}
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
            description={<><b>指标含义：</b>各渠道的综合健康评分，基于延迟、错误率、配额使用率等多维指标加权计算<br /><b>业务意义：</b>快速识别需要关注的渠道，分数越低越需要排查问题或准备切换。理想评分应在 90 分以上<br /><b>计算逻辑：</b>加权综合评分 = 100 - (延迟扣分 + 错误率扣分 + 配额扣分)。延迟高、错误多、配额紧张都会降低评分<br /><b>补充说明：</b>健康评分是综合指标，低于 80 分建议告警并准备流量切换。各维度权重可根据业务需求调整</>}
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
            description={<><b>指标含义：</b>各 AI 供应商渠道的每日错误率随时间的变化趋势，多渠道对比<br /><b>业务意义：</b>监控不同渠道的稳定性波动，及时发现渠道质量恶化趋势，为渠道切换提供数据依据<br /><b>计算逻辑：</b>按 channel_id 和日期分组，SUM(error_count)/COUNT(*) × 100%，按日期升序展示多系列<br /><b>补充说明：</b>错误率突增通常由上游服务故障引起，建议配置渠道级错误率告警阈值（如 &gt;5%）</>}
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
            description={<><b>指标含义：</b>各 AI 供应商渠道的配额使用状态（正常/耗尽/即将重置）和下次配额重置时间<br /><b>业务意义：</b>监控渠道可用性，提前防范因配额耗尽导致的服务中断。配额耗尽前应及时切换或申请提升<br /><b>计算逻辑：</b>从数据源读取各渠道的已用量、上限、重置时间，计算使用率 = 已用量/上限 × 100%，判断状态<br /><b>补充说明：</b>建议在配额使用率达到 80% 时发送预警，90% 时自动触发流量切换。不同渠道的配额周期可能不同（按天/月）</>}
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
            description={<><b>指标含义：</b>各 AI 供应商渠道按模型分组的每 Token 平均成本（Cost per Token）对比<br /><b>业务意义：</b>辅助成本优化和渠道选择决策，选择性价比更高的渠道以降低运营成本<br /><b>计算逻辑：</b>按 channel_id 和 model_id 分组，SUM(total_cost)/SUM(total_tokens)，计算每 Token 均价。建议同模型跨渠道对比<br /><b>补充说明：</b>价格不是唯一因素，应综合延迟、稳定性、可用模型种类等因素权衡选择。同模型跨渠道价差大时值得关注</>}
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
