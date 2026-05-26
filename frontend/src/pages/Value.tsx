import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line } from '@ant-design/charts'
import ChartCard from '../components/ChartCard'
import PieWithLegend from '../components/PieWithLegend'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
import { CHART_COLORS, CHART_PRIMARY } from '../config/chartTheme'
import {
  fetchHeavyUsers, fetchTokenRanking, fetchRFMMatrix,
  fetchChannelEfficiency, fetchProjectContribution, fetchModelOutputRanking,
  type HeavyUser, type TokenRanking, type RFMQuadrant,
  type ChannelEfficiency, type ProjectContributionPoint, type ModelOutputRanking,
} from '../api/metrics'

export default function Value() {
  const filters = useFilterStore()

  const [heavyUsers, setHeavyUsers] = useState<HeavyUser[]>([])
  const [heavyUsersLoading, setHeavyUsersLoading] = useState(false)
  const [heavyUsersError, setHeavyUsersError] = useState<string | null>(null)

  const [tokenRanking, setTokenRanking] = useState<TokenRanking[]>([])
  const [tokenRankingLoading, setTokenRankingLoading] = useState(false)
  const [tokenRankingError, setTokenRankingError] = useState<string | null>(null)

  const [rfm, setRfm] = useState<RFMQuadrant[]>([])
  const [rfmLoading, setRfmLoading] = useState(false)
  const [rfmError, setRfmError] = useState<string | null>(null)

  const [channelEff, setChannelEff] = useState<ChannelEfficiency[]>([])
  const [channelEffLoading, setChannelEffLoading] = useState(false)
  const [channelEffError, setChannelEffError] = useState<string | null>(null)

  const [projectContrib, setProjectContrib] = useState<ProjectContributionPoint[]>([])
  const [projectContribLoading, setProjectContribLoading] = useState(false)
  const [projectContribError, setProjectContribError] = useState<string | null>(null)

  const [modelOutput, setModelOutput] = useState<ModelOutputRanking[]>([])
  const [modelOutputLoading, setModelOutputLoading] = useState(false)
  const [modelOutputError, setModelOutputError] = useState<string | null>(null)

  const loadHeavyUsers = useCallback(async () => {
    setHeavyUsersLoading(true); setHeavyUsersError(null)
    try { setHeavyUsers(await fetchHeavyUsers(filters)) }
    catch (e: any) { setHeavyUsersError(e.message) }
    finally { setHeavyUsersLoading(false) }
  }, [filters])

  const loadTokenRanking = useCallback(async () => {
    setTokenRankingLoading(true); setTokenRankingError(null)
    try { setTokenRanking(await fetchTokenRanking(filters)) }
    catch (e: any) { setTokenRankingError(e.message) }
    finally { setTokenRankingLoading(false) }
  }, [filters])

  const loadRfm = useCallback(async () => {
    setRfmLoading(true); setRfmError(null)
    try { setRfm(await fetchRFMMatrix(filters)) }
    catch (e: any) { setRfmError(e.message) }
    finally { setRfmLoading(false) }
  }, [filters])

  const loadChannelEff = useCallback(async () => {
    setChannelEffLoading(true); setChannelEffError(null)
    try { setChannelEff(await fetchChannelEfficiency(filters)) }
    catch (e: any) { setChannelEffError(e.message) }
    finally { setChannelEffLoading(false) }
  }, [filters])

  const loadProjectContrib = useCallback(async () => {
    setProjectContribLoading(true); setProjectContribError(null)
    try { setProjectContrib(await fetchProjectContribution(filters)) }
    catch (e: any) { setProjectContribError(e.message) }
    finally { setProjectContribLoading(false) }
  }, [filters])

  const loadModelOutput = useCallback(async () => {
    setModelOutputLoading(true); setModelOutputError(null)
    try { setModelOutput(await fetchModelOutputRanking(filters)) }
    catch (e: any) { setModelOutputError(e.message) }
    finally { setModelOutputLoading(false) }
  }, [filters])

  useEffect(() => { loadHeavyUsers() }, [loadHeavyUsers])
  useEffect(() => { loadTokenRanking() }, [loadTokenRanking])
  useEffect(() => { loadRfm() }, [loadRfm])
  useEffect(() => { loadChannelEff() }, [loadChannelEff])
  useEffect(() => { loadProjectContrib() }, [loadProjectContrib])
  useEffect(() => { loadModelOutput() }, [loadModelOutput])

  // Transform project contribution for multi-line chart
  const projectLines = projectContrib.map(p => ({
    date: p.date,
    value: p.request_count,
    project: p.project_name || `#${p.project_id}`,
  }))

  const rfmPieData = rfm.map(d => ({ type: d.quadrant, value: d.user_count }))

  return (
    <Flex vertical gap={16}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="重度用户 Top 20"
            loading={heavyUsersLoading}
            error={heavyUsersError}
            empty={heavyUsers.length === 0 && !heavyUsersLoading && !heavyUsersError}
            onRetry={loadHeavyUsers}
            description={<><b>指标含义：</b>按请求量降序排列的前 20 名用户及其请求数、Token 消耗、费用等详细数据<br /><b>业务意义：</b>识别核心高价值用户（HVC），为 VIP 服务、个性化运营和重点维护提供数据支撑<br /><b>计算逻辑：</b>按 employee_id 分组，SUM(request_count)、SUM(total_tokens)、SUM(total_cost)，按请求量 DESC LIMIT 20<br /><b>补充说明：</b>重度用户通常贡献了大部分的使用量和费用，符合 80/20 法则。应重点关注这些用户的体验和留存</>}
          >
            <MetricTable
              dataSource={heavyUsers}
              rowKey="employee_id"
              columns={[
                { key: 'name', title: '用户', render: (r: HeavyUser) => r.employee_name || r.name || r.employee_id || '-' },
                { key: 'employee_org_name', title: '组织', render: (r: HeavyUser) => r.employee_org_name || '-' },
                { key: 'request_count', title: '请求量' },
                { key: 'total_tokens', title: 'Token 数', render: (r: HeavyUser) => r.total_tokens.toLocaleString() },
                { key: 'total_cost', title: '费用', render: (r: HeavyUser) => `$${r.total_cost.toFixed(4)}` },
              ]}
              loading={heavyUsersLoading}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="RFM 用户价值四象限"
            loading={rfmLoading}
            error={rfmError}
            empty={rfm.length === 0 && !rfmLoading && !rfmError}
            onRetry={loadRfm}
            description={<><b>指标含义：</b>基于请求频率高频（≥100 次）和费用高价（≥$10）两个维度，将用户划分为四个象限：高频高价值、高频低价值、低频高价值、低频低价值<br /><b>业务意义：</b>辅助用户分层运营，对不同象限用户采取差异化策略。高频高价值用户是核心用户应重点维护，低频高价值用户有提升频率的潜力<br /><b>计算逻辑：</b>统计每个用户的请求总数和总费用，以 100 次请求和 $10 费用为阈值进行四象限分类，COUNT 各象限用户数<br /><b>补充说明：</b>阈值可根据平台的实际情况调整。建议定期（月度）更新 RFM 分类，观察用户在象限间的迁移趋势</>}
            height={300}
          >
            <PieWithLegend data={rfmPieData} loading={rfmLoading} height={280} />
          </ChartCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Token 排名"
            loading={tokenRankingLoading}
            error={tokenRankingError}
            empty={tokenRanking.length === 0 && !tokenRankingLoading && !tokenRankingError}
            onRetry={loadTokenRanking}
            description={<><b>指标含义：</b>各模型在筛选时间段内的 Prompt Token 和 Completion Token 消耗量排名对比<br /><b>业务意义：</b>了解各模型的算力资源消耗分布，识别 Token 消耗大户，为资源规划和模型选型提供依据<br /><b>计算逻辑：</b>按 model_id 和 Token 类型（prompt/completion）分组，SUM(token_count)，按总量降序排列<br /><b>补充说明：</b>Prompt 和 Completion 的比例可反映模型的使用场景：高 Prompt 说明输入量大（如文档分析），高 Completion 说明生成内容多（如写作辅助）</>}
          >
            <Column
              data={tokenRanking.flatMap(r => [
                { model_id: r.model_id, type: 'Prompt', tokens: r.total_prompt },
                { model_id: r.model_id, type: 'Completion', tokens: r.total_completion },
              ])}
              xField="model_id"
              yField="tokens"
              colorField="type"
              color={CHART_COLORS}
              axis={{ x: { title: 'Model', labelAutoHide: true } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="模型产出排名"
            loading={modelOutputLoading}
            error={modelOutputError}
            empty={modelOutput.length === 0 && !modelOutputLoading && !modelOutputError}
            onRetry={loadModelOutput}
            description={<><b>指标含义：</b>各模型生成的 Completion Token 总量排名，同时展示对应的请求数和平均每次产出长度<br /><b>业务意义：</b>评估模型的内容生成效率。平均产出长度可反映模型的回答详细程度和用户对生成内容的期望<br /><b>计算逻辑：</b>按 model_id 分组，SUM(completion_tokens)、COUNT(*)、AVG(completion_tokens)，按 Completion Token 总量降序排列<br /><b>补充说明：</b>平均产出长度并非越长越好，应与任务类型结合分析。代码生成和文档写作通常产出较长</>}
          >
            <Column
              data={modelOutput}
              xField="model_id"
              yField="total_tokens"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Model', labelAutoHide: true }, y: { title: 'Total Tokens' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="渠道产出效率"
            loading={channelEffLoading}
            error={channelEffError}
            empty={channelEff.length === 0 && !channelEffLoading && !channelEffError}
            onRetry={loadChannelEff}
            description={<><b>指标含义：</b>各 AI 供应商渠道每花费 1 美元所获得的 Token 产出量（Tokens per Dollar）<br /><b>业务意义：</b>评估各渠道的成本效益（性价比），辅助渠道选择和预算分配决策，优化支出结构<br /><b>计算逻辑：</b>SUM(total_tokens) ÷ SUM(total_cost)。按 channel_id 分组计算，数值越高说明性价比越好<br /><b>补充说明：</b>不同模型的价格差异大，对比时应尽量同模型对比以消除模型因素。需同时关注质量和延迟</>}
          >
            <Column
              data={channelEff}
              xField="channel_name"
              yField="tokens_per_dollar"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Channel' }, y: { title: 'Tokens/$' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="项目贡献度趋势"
            loading={projectContribLoading}
            error={projectContribError}
            empty={projectLines.length === 0 && !projectContribLoading && !projectContribError}
            onRetry={loadProjectContrib}
            description={<><b>指标含义：</b>各项目在时间轴上的请求量和 Token 消耗变化趋势，支持多项目对比<br /><b>业务意义：</b>了解各项目的使用规模变化和增长趋势，评估项目的贡献度和资源消耗合理性<br /><b>计算逻辑：</b>按项目和日期分组，COUNT(*) 请求量和 SUM(total_tokens) Token 消耗，按日期升序展示多系列折线<br /><b>补充说明：</b>可辅助项目维度成本核算和资源配额管理，发现异常增长的"爆款"项目</>}
          >
            <Line
              data={projectLines}
              xField="date"
              yField="value"
              colorField="project"
              color={CHART_COLORS}
              axis={{ x: { title: 'Date' }, y: { title: 'Requests' } }}
            />
          </ChartCard>
        </Col>
      </Row>
    </Flex>
  )
}
