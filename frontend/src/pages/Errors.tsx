import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line } from '@ant-design/charts'
import ChartCard from '../components/ChartCard'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
import { CHART_COLORS, CHART_PRIMARY } from '../config/chartTheme'
import {
  fetchErrorRateTrend, fetchErrorTypeDistribution,
  fetchErrorByModel, fetchErrorByChannel,
  fetchErrorHeatmap, fetchTopFailingUsers,
  fetchChannelErrorMatrix, fetchRetrySuccessRate,
  fetchStatusCodeDistribution,
  type ErrorRatePoint, type ErrorTypeDist, type ErrorByModel,
  type ErrorByChannel, type ErrorHeatmapPoint, type TopFailingUser,
  type ChannelErrorMatrixPoint, type RetrySuccessCategory,
  type StatusCodeDist,
} from '../api/metrics'

export default function Errors() {
  const filters = useFilterStore()

  const [rateTrend, setRateTrend] = useState<ErrorRatePoint[]>([])
  const [rateTrendLoading, setRateTrendLoading] = useState(false)
  const [rateTrendError, setRateTrendError] = useState<string | null>(null)

  const [typeDist, setTypeDist] = useState<ErrorTypeDist[]>([])
  const [typeDistLoading, setTypeDistLoading] = useState(false)
  const [typeDistError, setTypeDistError] = useState<string | null>(null)

  const [byModel, setByModel] = useState<ErrorByModel[]>([])
  const [byModelLoading, setByModelLoading] = useState(false)
  const [byModelError, setByModelError] = useState<string | null>(null)

  const [byChannel, setByChannel] = useState<ErrorByChannel[]>([])
  const [byChannelLoading, setByChannelLoading] = useState(false)
  const [byChannelError, setByChannelError] = useState<string | null>(null)

  const [heatmap, setHeatmap] = useState<ErrorHeatmapPoint[]>([])
  const [heatmapLoading, setHeatmapLoading] = useState(false)
  const [heatmapError, setHeatmapError] = useState<string | null>(null)

  const [topUsers, setTopUsers] = useState<TopFailingUser[]>([])
  const [topUsersLoading, setTopUsersLoading] = useState(false)
  const [topUsersError, setTopUsersError] = useState<string | null>(null)

  const [channelMatrix, setChannelMatrix] = useState<ChannelErrorMatrixPoint[]>([])
  const [channelMatrixLoading, setChannelMatrixLoading] = useState(false)
  const [channelMatrixError, setChannelMatrixError] = useState<string | null>(null)

  const [retryRate, setRetryRate] = useState<RetrySuccessCategory[]>([])
  const [retryRateLoading, setRetryRateLoading] = useState(false)
  const [retryRateError, setRetryRateError] = useState<string | null>(null)

  const [statusCodeDist, setStatusCodeDist] = useState<StatusCodeDist[]>([])
  const [statusCodeDistLoading, setStatusCodeDistLoading] = useState(false)
  const [statusCodeDistError, setStatusCodeDistError] = useState<string | null>(null)

  const loadRateTrend = useCallback(async () => {
    setRateTrendLoading(true); setRateTrendError(null)
    try { setRateTrend(await fetchErrorRateTrend(filters)) }
    catch (e: any) { setRateTrendError(e.message) }
    finally { setRateTrendLoading(false) }
  }, [filters])

  const loadTypeDist = useCallback(async () => {
    setTypeDistLoading(true); setTypeDistError(null)
    try { setTypeDist(await fetchErrorTypeDistribution(filters)) }
    catch (e: any) { setTypeDistError(e.message) }
    finally { setTypeDistLoading(false) }
  }, [filters])

  const loadByModel = useCallback(async () => {
    setByModelLoading(true); setByModelError(null)
    try { setByModel(await fetchErrorByModel(filters)) }
    catch (e: any) { setByModelError(e.message) }
    finally { setByModelLoading(false) }
  }, [filters])

  const loadByChannel = useCallback(async () => {
    setByChannelLoading(true); setByChannelError(null)
    try { setByChannel(await fetchErrorByChannel(filters)) }
    catch (e: any) { setByChannelError(e.message) }
    finally { setByChannelLoading(false) }
  }, [filters])

  const loadHeatmap = useCallback(async () => {
    setHeatmapLoading(true); setHeatmapError(null)
    try { setHeatmap(await fetchErrorHeatmap(filters)) }
    catch (e: any) { setHeatmapError(e.message) }
    finally { setHeatmapLoading(false) }
  }, [filters])

  const loadTopUsers = useCallback(async () => {
    setTopUsersLoading(true); setTopUsersError(null)
    try { setTopUsers(await fetchTopFailingUsers(filters)) }
    catch (e: any) { setTopUsersError(e.message) }
    finally { setTopUsersLoading(false) }
  }, [filters])

  const loadChannelMatrix = useCallback(async () => {
    setChannelMatrixLoading(true); setChannelMatrixError(null)
    try { setChannelMatrix(await fetchChannelErrorMatrix(filters)) }
    catch (e: any) { setChannelMatrixError(e.message) }
    finally { setChannelMatrixLoading(false) }
  }, [filters])

  const loadRetryRate = useCallback(async () => {
    setRetryRateLoading(true); setRetryRateError(null)
    try { setRetryRate(await fetchRetrySuccessRate(filters)) }
    catch (e: any) { setRetryRateError(e.message) }
    finally { setRetryRateLoading(false) }
  }, [filters])

  const loadStatusCodeDist = useCallback(async () => {
    setStatusCodeDistLoading(true); setStatusCodeDistError(null)
    try { setStatusCodeDist(await fetchStatusCodeDistribution(filters)) }
    catch (e: any) { setStatusCodeDistError(e.message) }
    finally { setStatusCodeDistLoading(false) }
  }, [filters])

  useEffect(() => { loadRateTrend() }, [loadRateTrend])
  useEffect(() => { loadTypeDist() }, [loadTypeDist])
  useEffect(() => { loadByModel() }, [loadByModel])
  useEffect(() => { loadByChannel() }, [loadByChannel])
  useEffect(() => { loadHeatmap() }, [loadHeatmap])
  useEffect(() => { loadTopUsers() }, [loadTopUsers])
  useEffect(() => { loadChannelMatrix() }, [loadChannelMatrix])
  useEffect(() => { loadRetryRate() }, [loadRetryRate])
  useEffect(() => { loadStatusCodeDist() }, [loadStatusCodeDist])

  // Day-of-week labels
  const typePieData = typeDist.map(d => ({ type: d.status, value: d.count }))
  const retryPieData = retryRate.map(d => ({ type: d.category, value: d.trace_count }))
  const statusPieData = statusCodeDist.map(d => ({ type: d.status, value: d.count }))

  const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const heatmapData = heatmap.map(h => ({
    day: dayLabels[h.day_of_week - 1] || `Day${h.day_of_week}`,
    hour: `${h.hour}:00`,
    error_count: h.error_count,
  }))

  return (
    <Flex vertical gap={16}>
      {/* Row 1: Error rate trend + error type distribution */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="错误率趋势"
            loading={rateTrendLoading}
            error={rateTrendError}
            empty={rateTrend.length === 0 && !rateTrendLoading && !rateTrendError}
            onRetry={loadRateTrend}
            description={<><b>指标含义：</b>每日错误率（错误请求数 ÷ 总请求数 × 100%）随时间的变化曲线<br /><b>业务意义：</b>快速定位异常时间段，监控平台稳定性变化。错误率突增通常意味着上游 AI 供应商故障或系统异常<br /><b>计算逻辑：</b>按日期分组，COUNT(status IN ('failed','error','timeout','rate_limited')) ÷ COUNT(*) × 100%<br /><b>补充说明：</b>不同状态码反映不同问题：4xx 通常是用户端问题，5xx 通常是服务端问题，429 是限流</>}
          >
            <Line
              data={rateTrend}
              xField="date"
              yField="error_rate"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Date' }, y: { title: 'Error Rate %' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="错误类型分布"
            loading={typeDistLoading}
            error={typeDistError}
            empty={typeDist.length === 0 && !typeDistLoading && !typeDistError}
            onRetry={loadTypeDist}
            description={<><b>指标含义：</b>按 HTTP 状态码分组的错误数量和占比的分布情况<br /><b>业务意义：</b>了解错误的构成成分，优先解决高频错误类型，最大化提升平台稳定性<br /><b>计算逻辑：</b>按 status 分组，COUNT(*)，计算各状态码占比 = 该状态数量 ÷ 总错误数 × 100%<br /><b>补充说明：</b>建议对高频错误设置自动告警和自动恢复流程。401/403 通常是鉴权问题，500 是上游服务问题</>}
          >
            <Column
              data={typePieData}
              xField="type"
              yField="value"
              color={CHART_PRIMARY}
              axis={{ x: { title: '状态码', labelAutoHide: true }, y: { title: '次数' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 2: Error by model + error by channel */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="各模型错误数"
            loading={byModelLoading}
            error={byModelError}
            empty={byModel.length === 0 && !byModelLoading && !byModelError}
            onRetry={loadByModel}
            description={<><b>指标含义：</b>按 AI 模型分组的错误发生次数对比<br /><b>业务意义：</b>评估各模型的稳定性表现，识别问题较多的模型，辅助模型选型决策<br /><b>计算逻辑：</b>按 model_id 分组，COUNT(status IN ('failed','error','timeout'))，按错误数降序排列<br /><b>补充说明：</b>错误数高可能是该模型使用量大导致的绝对数高，建议结合错误率（错误数 ÷ 总请求数）综合评估</>}
          >
            <Column
              data={byModel}
              xField="model_id"
              yField="error_count"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Model', labelAutoHide: true }, y: { title: 'Error Count' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="各渠道错误数"
            loading={byChannelLoading}
            error={byChannelError}
            empty={byChannel.length === 0 && !byChannelLoading && !byChannelError}
            onRetry={loadByChannel}
            description={<><b>指标含义：</b>按 AI 供应商渠道分组的错误发生次数对比<br /><b>业务意义：</b>识别可靠性较低的渠道，为渠道权重调整和故障转移提供数据支持<br /><b>计算逻辑：</b>按 channel_id 分组，COUNT(status IN ('failed','error','timeout'))，按错误数降序排列<br /><b>补充说明：</b>建议设置多渠道容灾策略，当主力渠道错误率超过阈值时自动切换到备用渠道</>}
          >
            <Column
              data={byChannel}
              xField="channel_name"
              yField="error_count"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Channel' }, y: { title: 'Error Count' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 3: Error heatmap + top failing users */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="错误热力图 (时段 × 星期)"
            loading={heatmapLoading}
            error={heatmapError}
            empty={heatmapData.length === 0 && !heatmapLoading && !heatmapError}
            onRetry={loadHeatmap}
            description={<><b>指标含义：</b>按小时和星期交叉维度展示的错误数量分布热力图<br /><b>业务意义：</b>发现错误高发的时间段和星期模式，帮助定位是周期性故障还是持续性问题<br /><b>计算逻辑：</b>按 EXTRACT(HOUR FROM created_at) 和 EXTRACT(DOW FROM created_at) 分组，COUNT(status IN ('failed','error'))<br /><b>补充说明：</b>如果在某些固定时段错误集中爆发，可能是上游定时维护、配额重置或定时任务触发导致的</>}
          >
            <Column
              data={heatmapData}
              xField="hour"
              yField="error_count"
              colorField="day"
              color={CHART_COLORS}
              axis={{ x: { title: 'Hour', labelAutoHide: true }, y: { title: 'Errors' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="失败 Top 用户"
            loading={topUsersLoading}
            error={topUsersError}
            empty={topUsers.length === 0 && !topUsersLoading && !topUsersError}
            onRetry={loadTopUsers}
            description={<><b>指标含义：</b>筛选时间段内请求失败次数最多的前 10 名用户及对应的错误详情<br /><b>业务意义：</b>识别使用模式异常的用户，排查是用户端问题（key 配置错误）还是服务端问题<br /><b>计算逻辑：</b>按 employee_id 分组，COUNT(status IN ('failed','error','timeout'))，按失败次数降序排列，展示详细信息<br /><b>补充说明：</b>失败次数异常高的用户可能存在 API Key 配置错误或使用了不兼容的参数，建议主动联系排查</>}
          >
            <MetricTable
              dataSource={topUsers}
              rowKey="employee_id"
              columns={[
                { key: 'name', title: '用户', render: (r: TopFailingUser) => r.employee_name || r.name || r.employee_id || '-' },
                { key: 'employee_org_name', title: '组织', render: (r: TopFailingUser) => r.employee_org_name || '-' },
                { key: 'request_count', title: '总请求数' },
                { key: 'error_count', title: '失败数' },
                { key: 'error_rate', title: '失败率', render: (r: TopFailingUser) => `${r.error_rate}%` },
              ]}
              loading={topUsersLoading}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 4: Channel error matrix + retry success rate + status code distribution */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="渠道 × 状态矩阵"
            loading={channelMatrixLoading}
            error={channelMatrixError}
            empty={channelMatrix.length === 0 && !channelMatrixLoading && !channelMatrixError}
            onRetry={loadChannelMatrix}
            description={<><b>指标含义：</b>各渠道在不同 HTTP 状态码上的请求数量和占比的交叉分析表<br /><b>业务意义：</b>了解各渠道的响应质量分布和异常模式差异，评估各渠道的可靠性<br /><b>计算逻辑：</b>按 channel_id 和 status 分组交叉统计 COUNT(*)，展示每个渠道的状态码分布矩阵<br /><b>补充说明：</b>不同渠道的异常模式不同：某渠道 5xx 多说明该上游不稳定，某渠道 429 多说明配额限制严格</>}
          >
            <MetricTable
              dataSource={channelMatrix}
              rowKey={(r: ChannelErrorMatrixPoint) => `${r.channel_id}-${r.status}`}
              columns={[
                { key: 'channel_name', title: '渠道' },
                { key: 'status', title: '状态' },
                { key: 'count', title: '请求数' },
              ]}
              loading={channelMatrixLoading}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <ChartCard
                title="重试成功率"
                loading={retryRateLoading}
                error={retryRateError}
                empty={retryRate.length === 0 && !retryRateLoading && !retryRateError}
                onRetry={loadRetryRate}
                description={<><b>指标含义：</b>被重试的请求最终的成功和失败比例分布<br /><b>业务意义：</b>评估重试机制的有效性和自动恢复能力。高重试成功率说明故障是瞬时的，重试策略有效<br /><b>计算逻辑：</b>对 trace_id 关联的重试请求，按最终状态分组统计。成功 ÷ 总重试数 × 100%<br /><b>补充说明：</b>如果重试成功率低，说明故障是持续性的（如上游宕机），重试只会浪费资源和增加成本</>}
              >
                <Column
                  data={retryPieData}
                  xField="type"
                  yField="value"
                  color={CHART_PRIMARY}
                  axis={{ x: { title: '类别', labelAutoHide: true }, y: { title: '追踪数' } }}
                />
              </ChartCard>
            </Col>
            <Col xs={24} sm={12}>
              <ChartCard
                title="状态码分布"
                loading={statusCodeDistLoading}
                error={statusCodeDistError}
                empty={statusCodeDist.length === 0 && !statusCodeDistLoading && !statusCodeDistError}
                onRetry={loadStatusCodeDist}
                description={<><b>指标含义：</b>所有请求中按 HTTP 状态码分组统计的占比分布<br /><b>业务意义：</b>了解请求的完整响应画像，包括成功、失败、限流、鉴权失败等各类响应的比例<br /><b>计算逻辑：</b>按 status 分组 COUNT(*)，计算该状态码占所有请求的百分比<br /><b>补充说明：</b>正常情况 2xx 应占 95% 以上。429 比例高说明需要提高配额或优化请求频率，5xx 比例高需要关注上游服务</>}
              >
                <Column
                  data={statusPieData}
                  xField="type"
                  yField="value"
                  color={CHART_PRIMARY}
                  axis={{ x: { title: '状态码', labelAutoHide: true }, y: { title: '次数' } }}
                />
              </ChartCard>
            </Col>
          </Row>
        </Col>
      </Row>
    </Flex>
  )
}
