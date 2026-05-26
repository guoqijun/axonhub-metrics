import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line } from '@ant-design/charts'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
import { CHART_PRIMARY } from '../config/chartTheme'
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

  const sessionPieData = sessionDur.map(d => ({ type: d.bucket, value: d.count }))

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
            description={<><b>指标含义：</b>用户每次对话（由 trace_id 标识的会话）中的平均 API 请求轮次数量<br /><b>业务意义：</b>反映用户与 AI 的互动深度和对话复杂度。轮次越多说明用户进行的是复杂的多轮对话而非单次查询<br /><b>计算逻辑：</b>按 trace_id 分组 COUNT(request_id)，计算所有 trace 的平均值。AVG(COUNT per trace)<br /><b>补充说明：</b>对话轮次受业务场景影响大，客服类通常轮次多，简单问答类轮次少</>}
          />
        </Col>
        <Col xs={24} sm={8}>
          <KPICard
            title="平均 Token/请求"
            value={avgTokens?.avg_tokens ?? 0}
            precision={0}
            suffix="tokens"
            loading={avgTokensLoading}
            description={<><b>指标含义：</b>每次 API 请求的平均 Token 消耗总量（含 Prompt 和 Completion）<br /><b>业务意义：</b>反映用户的使用强度和输入输出规模，辅助评估模型计算资源的消耗效率<br /><b>计算逻辑：</b>SUM(total_tokens) ÷ COUNT(*)。可按时间段分组计算趋势变化<br /><b>补充说明：</b>Token 消耗量受模型能力和任务复杂度影响，长文本任务（如文档分析）通常消耗更多</>}
          />
        </Col>
        <Col xs={24} sm={8}>
          <KPICard
            title="流式使用比例"
            value={streamRatio ? (streamRatio.stream_ratio * 100) : 0}
            suffix="%"
            precision={1}
            loading={streamRatioLoading}
            description={<><b>指标含义：</b>使用 stream=true 的流式请求占总请求的比例<br /><b>业务意义：</b>流式请求能显著降低首 Token 延迟（TTFT），提升用户体验。该比例反映用户对流式接口的接受度和前端实现水平<br /><b>计算逻辑：</b>COUNT(stream=true) ÷ COUNT(*) × 100%<br /><b>补充说明：</b>流式请求虽体验好，但部分场景（如简单查询、函数调用）可能不需要流式，非流式也有其适用场景</>}
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
            description={<><b>指标含义：</b>按 trace_id 计算会话的起止时间差，并按时长分桶统计用户分布<br /><b>业务意义：</b>了解用户单次使用时长分布，评估产品的使用深度和使用场景类型<br /><b>计算逻辑：</b>按 trace_id 分组计算 MAX(created_at) - MIN(created_at)，按分钟/小时分桶统计<br /><b>补充说明：</b>短会话（&lt;1 分钟）通常为简单查询，长会话（&gt;10 分钟）通常为复杂任务或多次迭代</>}
          >
            <Column
              data={sessionPieData}
              xField="type"
              yField="value"
              color={CHART_PRIMARY}
              axis={{ x: { title: '时长', labelAutoHide: true }, y: { title: '会话数' } }}
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
            description={<><b>指标含义：</b>按用户的请求数量进行分桶（如 1 次、2-5 次、6-20 次等），统计每个桶内的用户数<br /><b>业务意义：</b>了解用户的使用频率分布结构，识别高频用户和一次性用户的比例<br /><b>计算逻辑：</b>先按用户 COUNT 请求数，再按 COUNT 结果分桶 GROUP BY<br /><b>补充说明：</b>理想的分布应是"头重尾轻"，即高频用户占主导。若大量用户仅使用 1 次，说明用户留存或激活存在问题</>}
          >
            <Column
              data={freqBuckets}
              xField="bucket"
              yField="user_count"
              color={CHART_PRIMARY}
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
            description={<><b>指标含义：</b>每个 AI 供应商渠道的日平均请求量对比<br /><b>业务意义：</b>评估不同渠道的使用强度，辅助流量分配和渠道资源优化<br /><b>计算逻辑：</b>按渠道和日期分组 COUNT(*)，再计算每个渠道的日平均值 = SUM(每日请求数) ÷ 天数<br /><b>补充说明：</b>日均请求受渠道配额限制，过高的日均可能导致配额快速耗尽</>}
          >
            <Column
              data={channelDaily}
              xField="channel_name"
              yField="daily_avg"
              color={CHART_PRIMARY}
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
            description={<><b>指标含义：</b>每日人均请求数 = 总请求数 ÷ 日活跃用户数，随时间的变化趋势<br /><b>业务意义：</b>反映用户使用密度的变化。人均请求数上升说明用户越来越依赖平台，使用深度在增加<br /><b>计算逻辑：</b>每日 COUNT(*) ÷ COUNT(DISTINCT employee_id)，按日期升序展示<br /><b>补充说明：</b>该指标与 DAU 结合分析更有价值：DAU 上升 + 人均请求上升 = 健康增长；DAU 上升 + 人均请求下降 = 用户稀释</>}
          >
            <Line
              data={perCapita}
              xField="date"
              yField="per_capita"
              color={CHART_PRIMARY}
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
            description={<><b>指标含义：</b>按用户首次出现月份（注册月份）分组，跟踪各批次用户在后续各月的留存表现<br /><b>业务意义：</b>评估不同时期引入的用户的长期留存能力，判断用户质量和产品粘性变化趋势<br /><b>计算逻辑：</b>按用户首次出现月份分组，统计各组在后续每个月中仍活跃的用户数和比例（留存率）<br /><b>补充说明：</b>通常关注 N-day 留存（次日/7日/30日留存），留存曲线下降越快说明产品粘性越差</>}
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
