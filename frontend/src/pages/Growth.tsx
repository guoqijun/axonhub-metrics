import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line } from '@ant-design/charts'
import ChartCard from '../components/ChartCard'
import PieWithLegend from '../components/PieWithLegend'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
import { CHART_COLORS, CHART_PRIMARY } from '../config/chartTheme'
import {
  fetchMomYoy, fetchGrowthForecast, fetchUserGrowthCurve,
  fetchModelGrowthRate, fetchChannelMarketShare, fetchProjectGrowthRanking,
  type MomYoyPoint, type GrowthForecastPoint, type UserGrowthPoint,
  type ModelGrowthRate, type ChannelMarketShare, type ProjectGrowthRanking,
} from '../api/metrics'

export default function Growth() {
  const filters = useFilterStore()

  const [momYoy, setMomYoy] = useState<MomYoyPoint[]>([])
  const [momYoyLoading, setMomYoyLoading] = useState(false)
  const [momYoyError, setMomYoyError] = useState<string | null>(null)

  const [forecast, setForecast] = useState<GrowthForecastPoint[]>([])
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState<string | null>(null)

  const [userGrowth, setUserGrowth] = useState<UserGrowthPoint[]>([])
  const [userGrowthLoading, setUserGrowthLoading] = useState(false)
  const [userGrowthError, setUserGrowthError] = useState<string | null>(null)

  const [modelGrowth, setModelGrowth] = useState<ModelGrowthRate[]>([])
  const [modelGrowthLoading, setModelGrowthLoading] = useState(false)
  const [modelGrowthError, setModelGrowthError] = useState<string | null>(null)

  const [marketShare, setMarketShare] = useState<ChannelMarketShare[]>([])
  const [marketShareLoading, setMarketShareLoading] = useState(false)
  const [marketShareError, setMarketShareError] = useState<string | null>(null)

  const [projectRank, setProjectRank] = useState<ProjectGrowthRanking[]>([])
  const [projectRankLoading, setProjectRankLoading] = useState(false)
  const [projectRankError, setProjectRankError] = useState<string | null>(null)

  const loadMomYoy = useCallback(async () => {
    setMomYoyLoading(true); setMomYoyError(null)
    try { setMomYoy(await fetchMomYoy(filters)) }
    catch (e: any) { setMomYoyError(e.message) }
    finally { setMomYoyLoading(false) }
  }, [filters])

  const loadForecast = useCallback(async () => {
    setForecastLoading(true); setForecastError(null)
    try { setForecast(await fetchGrowthForecast(filters)) }
    catch (e: any) { setForecastError(e.message) }
    finally { setForecastLoading(false) }
  }, [filters])

  const loadUserGrowth = useCallback(async () => {
    setUserGrowthLoading(true); setUserGrowthError(null)
    try { setUserGrowth(await fetchUserGrowthCurve(filters)) }
    catch (e: any) { setUserGrowthError(e.message) }
    finally { setUserGrowthLoading(false) }
  }, [filters])

  const loadModelGrowth = useCallback(async () => {
    setModelGrowthLoading(true); setModelGrowthError(null)
    try { setModelGrowth(await fetchModelGrowthRate(filters)) }
    catch (e: any) { setModelGrowthError(e.message) }
    finally { setModelGrowthLoading(false) }
  }, [filters])

  const loadMarketShare = useCallback(async () => {
    setMarketShareLoading(true); setMarketShareError(null)
    try { setMarketShare(await fetchChannelMarketShare(filters)) }
    catch (e: any) { setMarketShareError(e.message) }
    finally { setMarketShareLoading(false) }
  }, [filters])

  const loadProjectRank = useCallback(async () => {
    setProjectRankLoading(true); setProjectRankError(null)
    try { setProjectRank(await fetchProjectGrowthRanking(filters)) }
    catch (e: any) { setProjectRankError(e.message) }
    finally { setProjectRankLoading(false) }
  }, [filters])

  useEffect(() => { loadMomYoy() }, [loadMomYoy])
  useEffect(() => { loadForecast() }, [loadForecast])
  useEffect(() => { loadUserGrowth() }, [loadUserGrowth])
  useEffect(() => { loadModelGrowth() }, [loadModelGrowth])
  useEffect(() => { loadMarketShare() }, [loadMarketShare])
  useEffect(() => { loadProjectRank() }, [loadProjectRank])

  // Forecast: split by metric
  const forecastRequests = forecast.filter(f => f.metric === 'requests')
  const forecastReqsData = [
    ...forecastRequests.filter(f => f.actual !== null).map(f => ({ date: f.date, value: f.actual!, type: '实际' })),
    ...forecastRequests.filter(f => f.forecast !== null).map(f => ({ date: f.date, value: f.forecast!, type: '预测' })),
  ]
  // Latest month's market share for pie
  const months = [...new Set(marketShare.map(m => m.month))].sort()
  const latestMonth = months[months.length - 1]
  const latestShare = marketShare.filter(m => m.month === latestMonth)
  const sharePieData = latestShare.map(d => ({ type: d.channel_name ?? '', value: d.share_pct }))

  return (
    <Flex vertical gap={16}>
      {/* Row 1: MoM table + forecast requests */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="环比增长 (MoM)"
            loading={momYoyLoading}
            error={momYoyError}
            empty={momYoy.length === 0 && !momYoyLoading && !momYoyError}
            onRetry={loadMomYoy}
            description={<><b>指标含义：</b>月度环比（Month-over-Month）增长数据，展示每月请求量、用户数、总费用及环比增长率<br /><b>业务意义：</b>了解业务的月度变化趋势，识别增长加速或放缓的信号，辅助业务决策和目标制定<br /><b>计算逻辑：</b>本月值 ÷ 上月值 - 1 = 环比增长率。分别计算请求量、用户数和费用的月环比<br /><b>补充说明：</b>环比受季节性因素影响较大，建议结合同比（与去年同期对比）综合评估。连续 3 个月环比下降需要关注</>}
          >
            <MetricTable
              dataSource={momYoy}
              rowKey="month"
              columns={[
                { key: 'month', title: '月份' },
                { key: 'request_count', title: '请求数' },
                { key: 'request_growth_pct', title: '请求环比%', render: (r: MomYoyPoint) => `${r.request_growth_pct >= 0 ? '+' : ''}${r.request_growth_pct}%` },
                { key: 'user_count', title: '用户数' },
                { key: 'total_cost', title: '总费用', render: (r: MomYoyPoint) => `$${r.total_cost.toFixed(2)}` },
              ]}
              loading={momYoyLoading}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="请求量预测"
            loading={forecastLoading}
            error={forecastError}
            empty={forecastReqsData.length === 0 && !forecastLoading && !forecastError}
            onRetry={loadForecast}
            description={<><b>指标含义：</b>基于历史请求量数据使用时间序列模型预测的未来请求量，同时显示实际值和预测值双线<br /><b>业务意义：</b>辅助容量规划和资源预算，提前预知业务增长趋势，确保基础设施能够支撑未来需求<br /><b>计算逻辑：</b>基于历史每日请求量，使用线性回归或 Prophet 等时间序列模型预测未来 N 天的请求量<br /><b>补充说明：</b>预测受业务活动、市场变化等因素影响，仅供参考。建议结合实际业务计划调整预测</>}
          >
            <Line
              data={forecastReqsData}
              xField="date"
              yField="value"
              colorField="type"
              color={CHART_COLORS}
              axis={{ x: { title: 'Date' }, y: { title: 'Requests' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 2: User growth + model growth */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="用户增长曲线"
            loading={userGrowthLoading}
            error={userGrowthError}
            empty={userGrowth.length === 0 && !userGrowthLoading && !userGrowthError}
            onRetry={loadUserGrowth}
            description={<><b>指标含义：</b>每日新增用户数和累计用户数的时间序列曲线，区分新增和累计两个维度<br /><b>业务意义：</b>了解用户增长态势和存量规模。新增用户反映拉新效果，累计用户反映平台整体用户基础的增长<br /><b>计算逻辑：</b>新增用户 = 当日首次出现的 employee_id 数。累计用户 = 截止当日去重用户总数，逐日累加<br /><b>补充说明：</b>新增用户可能有波动，建议看 7 日移动平均。累计用户增长放缓可能说明市场接近饱和或推广力度不足</>}
          >
            <Line
              data={userGrowth.flatMap(u => [
                { date: u.date, type: '新增', value: u.new_users },
                { date: u.date, type: '累计', value: u.cumulative_users },
              ])}
              xField="date"
              yField="value"
              colorField="type"
              color={CHART_COLORS}
              axis={{ x: { title: 'Date' }, y: { title: 'Users' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="模型使用增长率"
            loading={modelGrowthLoading}
            error={modelGrowthError}
            empty={modelGrowth.length === 0 && !modelGrowthLoading && !modelGrowthError}
            onRetry={loadModelGrowth}
            description={<><b>指标含义：</b>各模型每月的请求数量数据，展示不同模型的使用增长变化<br /><b>业务意义：</b>了解各模型的受欢迎程度变化趋势，发现新兴热门模型，指导模型选型和推广策略调整<br /><b>计算逻辑：</b>按 model_id 和月份分组，COUNT(*)，按月升序排列。对比各模型在不同月份的请求量变化<br /><b>补充说明：</b>新型号发布后通常会出现使用量激增，关注模型间的"替代效应"（新模型是否在抢占旧模型的份额）</>}
          >
            <MetricTable
              dataSource={modelGrowth}
              rowKey={(r: ModelGrowthRate) => `${r.model_id}-${r.month}`}
              columns={[
                { key: 'model_id', title: '模型' },
                { key: 'month', title: '月份' },
                { key: 'request_count', title: '请求数' },
              ]}
              loading={modelGrowthLoading}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Row 3: Market share + project ranking */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title={`渠道市场份额 (${latestMonth || ''})`}
            loading={marketShareLoading}
            error={marketShareError}
            empty={marketShare.length === 0 && !marketShareLoading && !marketShareError}
            onRetry={loadMarketShare}
            description={<><b>指标含义：</b>各 AI 供应商渠道的请求量市场份额占比分布（基于最新月份数据）<br /><b>业务意义：</b>了解不同 AI 供应商的渠道格局变化，评估各渠道的竞争力和用户偏好<br /><b>计算逻辑：</b>按 channel_id 分组，COUNT(*) 各渠道请求数。占比 = 渠道请求数 ÷ 总请求数 × 100%<br /><b>补充说明：</b>市场份额变化反映渠道策略调整的效果。过度依赖单一渠道存在风险，建议保持渠道多元化</>}
            height={300}
          >
            <PieWithLegend data={sharePieData} loading={marketShareLoading} height={280}
              valueFormatter={(v) => v.toFixed(1) + '%'} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="项目增长排名"
            loading={projectRankLoading}
            error={projectRankError}
            empty={projectRank.length === 0 && !projectRankLoading && !projectRankError}
            onRetry={loadProjectRank}
            description={<><b>指标含义：</b>各项目的总请求量排名对比，展示项目级的使用分布<br /><b>业务意义：</b>识别使用量最大的核心项目和增长最快的潜力项目，评估各项目的推广成效和资源投入合理性<br /><b>计算逻辑：</b>按项目分组 COUNT(*)，按请求量降序排列。可同时展示用户数以评估项目的用户覆盖<br /><b>补充说明：</b>结合请求量和增长率两个维度分析：高请求量 + 高增长的项目是明星项目，低请求量 + 高增长的项目是潜力项目</>}
          >
            <Column
              data={projectRank}
              xField="project_name"
              yField="request_count"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Project' }, y: { title: 'Requests' } }}
            />
          </ChartCard>
        </Col>
      </Row>
    </Flex>
  )
}
