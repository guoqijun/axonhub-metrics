import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line, Pie } from '@ant-design/charts'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
import {
  fetchAvgConversationRounds, fetchAvgTokensPerRequest,
  fetchSessionDuration, fetchRequestFrequencyBuckets,
  fetchChannelDailyRequests, fetchStreamRatio,
  fetchUserRetentionCohort, fetchDailyPerCapita,
  type AvgConversationRounds, type AvgTokensPerRequest,
  type SessionDurationBucket, type FrequencyBucket,
  type ChannelDailyRequests, type StreamRatio,
  type RetentionCohortPoint, type DailyPerCapita,
} from '../api/metrics'

export default function Usage() {
  const filters = useFilterStore()

  const [convRounds, setConvRounds] = useState<AvgConversationRounds | null>(null)
  const [convRoundsLoading, setConvRoundsLoading] = useState(false)

  const [avgTokens, setAvgTokens] = useState<AvgTokensPerRequest | null>(null)
  const [avgTokensLoading, setAvgTokensLoading] = useState(false)

  const [streamRatio, setStreamRatio] = useState<StreamRatio | null>(null)
  const [streamRatioLoading, setStreamRatioLoading] = useState(false)

  const [sessionDur, setSessionDur] = useState<SessionDurationBucket[]>([])
  const [sessionDurLoading, setSessionDurLoading] = useState(false)
  const [sessionDurError, setSessionDurError] = useState<string | null>(null)

  const [freqBuckets, setFreqBuckets] = useState<FrequencyBucket[]>([])
  const [freqBucketsLoading, setFreqBucketsLoading] = useState(false)
  const [freqBucketsError, setFreqBucketsError] = useState<string | null>(null)

  const [channelDaily, setChannelDaily] = useState<ChannelDailyRequests[]>([])
  const [channelDailyLoading, setChannelDailyLoading] = useState(false)
  const [channelDailyError, setChannelDailyError] = useState<string | null>(null)

  const [retentionCohort, setRetentionCohort] = useState<RetentionCohortPoint[]>([])
  const [retentionCohortLoading, setRetentionCohortLoading] = useState(false)
  const [retentionCohortError, setRetentionCohortError] = useState<string | null>(null)

  const [perCapita, setPerCapita] = useState<DailyPerCapita[]>([])
  const [perCapitaLoading, setPerCapitaLoading] = useState(false)
  const [perCapitaError, setPerCapitaError] = useState<string | null>(null)

  const loadConvRounds = useCallback(async () => {
    setConvRoundsLoading(true)
    try { setConvRounds(await fetchAvgConversationRounds(filters)) }
    catch { /* silent */ }
    finally { setConvRoundsLoading(false) }
  }, [filters])

  const loadAvgTokens = useCallback(async () => {
    setAvgTokensLoading(true)
    try { setAvgTokens(await fetchAvgTokensPerRequest(filters)) }
    catch { /* silent */ }
    finally { setAvgTokensLoading(false) }
  }, [filters])

  const loadStreamRatio = useCallback(async () => {
    setStreamRatioLoading(true)
    try { setStreamRatio(await fetchStreamRatio(filters)) }
    catch { /* silent */ }
    finally { setStreamRatioLoading(false) }
  }, [filters])

  const loadSessionDur = useCallback(async () => {
    setSessionDurLoading(true)
    setSessionDurError(null)
    try { setSessionDur(await fetchSessionDuration(filters)) }
    catch (e: any) { setSessionDurError(e.message) }
    finally { setSessionDurLoading(false) }
  }, [filters])

  const loadFreqBuckets = useCallback(async () => {
    setFreqBucketsLoading(true)
    setFreqBucketsError(null)
    try { setFreqBuckets(await fetchRequestFrequencyBuckets(filters)) }
    catch (e: any) { setFreqBucketsError(e.message) }
    finally { setFreqBucketsLoading(false) }
  }, [filters])

  const loadChannelDaily = useCallback(async () => {
    setChannelDailyLoading(true)
    setChannelDailyError(null)
    try { setChannelDaily(await fetchChannelDailyRequests(filters)) }
    catch (e: any) { setChannelDailyError(e.message) }
    finally { setChannelDailyLoading(false) }
  }, [filters])

  const loadRetentionCohort = useCallback(async () => {
    setRetentionCohortLoading(true)
    setRetentionCohortError(null)
    try { setRetentionCohort(await fetchUserRetentionCohort(filters)) }
    catch (e: any) { setRetentionCohortError(e.message) }
    finally { setRetentionCohortLoading(false) }
  }, [filters])

  const loadPerCapita = useCallback(async () => {
    setPerCapitaLoading(true)
    setPerCapitaError(null)
    try { setPerCapita(await fetchDailyPerCapita(filters)) }
    catch (e: any) { setPerCapitaError(e.message) }
    finally { setPerCapitaLoading(false) }
  }, [filters])

  useEffect(() => { loadConvRounds() }, [loadConvRounds])
  useEffect(() => { loadAvgTokens() }, [loadAvgTokens])
  useEffect(() => { loadStreamRatio() }, [loadStreamRatio])
  useEffect(() => { loadSessionDur() }, [loadSessionDur])
  useEffect(() => { loadFreqBuckets() }, [loadFreqBuckets])
  useEffect(() => { loadChannelDaily() }, [loadChannelDaily])
  useEffect(() => { loadRetentionCohort() }, [loadRetentionCohort])
  useEffect(() => { loadPerCapita() }, [loadPerCapita])

  // Build cohort table data: unique cohorts x months
  const cohortMonths = [...new Set(retentionCohort.map(r => r.active_month))].sort()
  const cohortGroups = retentionCohort.reduce<Record<string, Record<string, number>>>((acc, r) => {
    if (!acc[r.cohort]) acc[r.cohort] = {}
    acc[r.cohort][r.active_month] = r.active_users
    return acc
  }, {})
  const cohortList = Object.entries(cohortGroups).sort(([a], [b]) => a.localeCompare(b))
  const cohortTableData = cohortList.map(([cohort, months]) => {
    const row: Record<string, any> = { cohort }
    for (const m of cohortMonths) {
      row[m] = months[m] || 0
    }
    return row
  })

  return (
    <Flex vertical gap={16}>
      {/* KPI Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <KPICard
            title="平均对话轮次"
            value={convRounds?.avg_rounds ?? 0}
            precision={1}
            suffix="rounds"
            loading={convRoundsLoading}
          />
        </Col>
        <Col xs={24} sm={8}>
          <KPICard
            title="平均 Token/请求"
            value={avgTokens?.avg_tokens ?? 0}
            precision={0}
            suffix="tokens"
            loading={avgTokensLoading}
          />
        </Col>
        <Col xs={24} sm={8}>
          <KPICard
            title="流式使用比例"
            value={streamRatio ? (streamRatio.stream_ratio * 100) : 0}
            suffix="%"
            precision={1}
            loading={streamRatioLoading}
          />
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="会话时长分布"
            loading={sessionDurLoading}
            error={sessionDurError}
            empty={sessionDur.length === 0 && !sessionDurLoading && !sessionDurError}
            onRetry={loadSessionDur}
          >
            <Pie
              data={sessionDur}
              angleField="count"
              colorField="bucket"
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="用户请求频率分布"
            loading={freqBucketsLoading}
            error={freqBucketsError}
            empty={freqBuckets.length === 0 && !freqBucketsLoading && !freqBucketsError}
            onRetry={loadFreqBuckets}
          >
            <Column
              data={freqBuckets}
              xField="bucket"
              yField="user_count"
              axis={{ x: { title: 'Requests/User' }, y: { title: 'Users' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="渠道日均请求"
            loading={channelDailyLoading}
            error={channelDailyError}
            empty={channelDaily.length === 0 && !channelDailyLoading && !channelDailyError}
            onRetry={loadChannelDaily}
          >
            <Column
              data={channelDaily}
              xField="channel_name"
              yField="daily_avg"
              axis={{ x: { title: 'Channel' }, y: { title: 'Daily Avg' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="日人均请求数"
            loading={perCapitaLoading}
            error={perCapitaError}
            empty={perCapita.length === 0 && !perCapitaLoading && !perCapitaError}
            onRetry={loadPerCapita}
          >
            <Line
              data={perCapita}
              xField="date"
              yField="per_capita"
              axis={{ x: { title: 'Date' }, y: { title: 'Req/User' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Retention Cohort Table */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <ChartCard
            title="用户留存 Cohort"
            loading={retentionCohortLoading}
            error={retentionCohortError}
            empty={cohortTableData.length === 0 && !retentionCohortLoading && !retentionCohortError}
            onRetry={loadRetentionCohort}
          >
            <MetricTable
              dataSource={cohortTableData}
              rowKey="cohort"
              columns={[
                { key: 'cohort', title: '注册月份' },
                ...cohortMonths.map(m => ({ key: m, title: m })),
              ]}
              loading={retentionCohortLoading}
            />
          </ChartCard>
        </Col>
      </Row>
    </Flex>
  )
}
