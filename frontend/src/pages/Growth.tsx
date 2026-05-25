import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line, Pie } from '@ant-design/charts'
import ChartCard from '../components/ChartCard'
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
            description="月度环比增长数据（请求量、用户数、费用、环比增长率），了解业务的月度变化趋势"
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
            description="基于历史趋势的请求量预测（含实际和预测双线），辅助容量规划和资源预算"
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
            description="新增用户和累计用户的时间序列（区分新增与累计），了解用户增长态势和存量规模"
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
            description="各模型的月度请求数据，了解不同模型的使用增长变化趋势"
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
            description="各渠道的请求量市场份额占比，了解不同 AI 供应商的渠道格局变化"
          >
            <Pie
              data={latestShare}
              angleField="share_pct"
              colorField="channel_name"
              color={CHART_COLORS}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="项目增长排名"
            loading={projectRankLoading}
            error={projectRankError}
            empty={projectRank.length === 0 && !projectRankLoading && !projectRankError}
            onRetry={loadProjectRank}
            description="各项目的请求量排名，了解项目级的使用分布变化，识别增长最快的项目"
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
