import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line, Pie } from '@ant-design/charts'
import ChartCard from '../components/ChartCard'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
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
          >
            <Line
              data={rateTrend}
              xField="date"
              yField="error_rate"
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
          >
            <Pie
              data={typeDist}
              angleField="count"
              colorField="status"
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
          >
            <Column
              data={byModel}
              xField="model_id"
              yField="error_count"
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
          >
            <Column
              data={byChannel}
              xField="channel_name"
              yField="error_count"
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
          >
            <Column
              data={heatmapData}
              xField="hour"
              yField="error_count"
              colorField="day"
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
          >
            <MetricTable
              dataSource={topUsers}
              rowKey="user_id"
              columns={[
                { key: 'name', title: '用户', render: (r: TopFailingUser) => r.name || r.email || `#${r.user_id}` },
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
              >
                <Pie
                  data={retryRate}
                  angleField="trace_count"
                  colorField="category"
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
              >
                <Pie
                  data={statusCodeDist}
                  angleField="count"
                  colorField="status"
                />
              </ChartCard>
            </Col>
          </Row>
        </Col>
      </Row>
    </Flex>
  )
}
