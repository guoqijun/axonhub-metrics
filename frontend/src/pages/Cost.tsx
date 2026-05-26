import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line } from '@ant-design/charts'
import ChartCard from '../components/ChartCard'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
import { CHART_COLORS, CHART_PRIMARY } from '../config/chartTheme'
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
            description={<><b>指标含义：</b>每日 Prompt Token、Completion Token 消耗量与对应费用的双轴时间序列趋势<br /><b>业务意义：</b>关联分析 Token 用量与成本的联动关系，发现成本异常波动的原因（是用量增长还是模型切换）<br /><b>计算逻辑：</b>按日期和 Token 类型分组，SUM(token_count) 和 SUM(total_cost)，按日期升序排列<br /><b>补充说明：</b>费用 = Token 数 × 模型单价，模型单价差异大（如 GPT-4 是 GPT-3.5 的 10-30 倍），切换模型会显著影响总费用</>}
          >
            <Line
              data={tokenFee.flatMap(d => [
                { date: d.date, type: 'Prompt Tokens', value: d.prompt_tokens },
                { date: d.date, type: 'Completion Tokens', value: d.completion_tokens },
              ])}
              xField="date"
              yField="value"
              colorField="type"
              color={CHART_COLORS}
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
            description={<><b>指标含义：</b>按 AI 模型分组统计的总费用对比，展示各模型产生的费用金额<br /><b>业务意义：</b>了解平台成本构成的模型分布，定位高消耗模型，为成本优化和模型选型提供数据支持<br /><b>计算逻辑：</b>按 model_id 分组，SUM(total_cost)，按费用降序排列<br /><b>补充说明：</b>高端模型（如 GPT-4、Claude Opus）虽然价格高但能力更强，应结合业务价值综合评估是否值得</>}
          >
            <Column
              data={modelDist}
              xField="model_id"
              yField="total_cost"
              color={CHART_PRIMARY}
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
            description={<><b>指标含义：</b>各 AI 供应商渠道产生的总费用对比<br /><b>业务意义：</b>评估不同渠道的成本表现，辅助渠道选择决策和预算分配<br /><b>计算逻辑：</b>按 channel_id 分组，SUM(total_cost)，按费用降序排列<br /><b>补充说明：</b>费用差异可能来自渠道定价策略不同或使用量的差异，建议结合单价分析以获取更准确的成本对比</>}
          >
            <Column
              data={channelComp}
              xField="channel_name"
              yField="total_cost"
              color={CHART_PRIMARY}
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
            description={<><b>指标含义：</b>筛选时间段内产生费用最多的前 10 名用户排名，包含费用金额、请求数和 Token 消耗<br /><b>业务意义：</b>识别高消耗用户，进行重点成本管理和预算分配。防止个别用户过度消耗预算<br /><b>计算逻辑：</b>按 employee_id 分组，SUM(total_cost)、COUNT(*)、SUM(token_count)，按费用降序排列 LIMIT 10<br /><b>补充说明：</b>高费用用户可能是高频使用者，也可能是使用了高单价模型。建议设置用户级预算告警</>}
          >
            <MetricTable
              dataSource={userTop}
              rowKey="employee_id"
              columns={[
                { key: 'name', title: '用户', render: (r: CostTopUser) => r.employee_name || r.name || r.employee_id || '-' },
                { key: 'employee_org_name', title: '组织', render: (r: CostTopUser) => r.employee_org_name || '-' },
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
            description={<><b>指标含义：</b>各项目在时间轴上的每日费用变化趋势，多项目折线对比<br /><b>业务意义：</b>了解项目维度的成本消耗趋势，辅助项目成本核算和预算控制<br /><b>计算逻辑：</b>按项目和日期分组，SUM(total_cost)，按日期升序展示多系列对比<br /><b>补充说明：</b>可设置项目级预算上限，超出自动告警。适合对内部部门进行成本回收（chargeback）的场景</>}
          >
            <Line
              data={projectDaily.map(p => ({
                date: p.date, value: p.total_cost, project: p.project_name || `#${p.project_id}`,
              }))}
              xField="date"
              yField="value"
              colorField="project"
              color={CHART_COLORS}
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
            description={<><b>指标含义：</b>每日缓存命中率（Cache Hit Rate）的时间序列趋势<br /><b>业务意义：</b>缓存命中率越高说明重复查询被缓存直接返回的比例越高，可以有效降低响应延迟和节省 API 调用费用<br /><b>计算逻辑：</b>COUNT(cache_hit=true) ÷ COUNT(*) × 100%，按日期分组计算。缓存命中表示请求结果直接从缓存返回，未调用上游 API<br /><b>补充说明：</b>缓存命中率受业务场景影响大，重复查询多的场景（如 FAQ）命中率高。理想值在 30% 以上</>}
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

      {/* Row 4 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="推理 Token 占比"
            loading={reasoningLoading}
            error={reasoningError}
            empty={reasoning.length === 0 && !reasoningLoading && !reasoningError}
            onRetry={loadReasoning}
            description={<><b>指标含义：</b>推理 Token（reasoning_tokens 或 thinking_tokens）占总 Token 消耗的比例变化趋势<br /><b>业务意义：</b>推理 Token 是模型内部推理过程的消耗，占比高说明用户大量使用需要深度推理的复杂任务场景<br /><b>计算逻辑：</b>SUM(reasoning_tokens) ÷ SUM(total_tokens) × 100%，按日期分组展示趋势<br /><b>补充说明：</b>推理 Token 通常不计入输出内容但对 API 调用仍然计费。高推理占比意味着使用场景多为复杂推理任务</>}
          >
            <Line
              data={reasoning}
              xField="date"
              yField="reasoning_pct"
              color={CHART_PRIMARY}
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
            description={<><b>指标含义：</b>基于历史成本数据使用简单时间序列模型（如线性回归或移动平均）预测的未来成本趋势<br /><b>业务意义：</b>辅助预算规划和成本控制决策，提前预见成本增长趋势，及时采取措施<br /><b>计算逻辑：</b>基于历史每日成本数据，使用线性回归或指数平滑预测未来 N 天的成本走势，同时展示实际值和预测值<br /><b>补充说明：</b>预测仅供参考，实际成本受业务波动、模型切换、促销活动等因素影响，建议定期更新预测模型</>}
          >
            <Line
              data={[...forecastActual, ...forecastPred]}
              xField="date"
              yField="value"
              colorField="type"
              color={CHART_COLORS}
              axis={{ x: { title: 'Date' }, y: { title: 'Cost ($)' } }}
            />
          </ChartCard>
        </Col>
      </Row>
    </Flex>
  )
}
