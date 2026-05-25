import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line, Pie } from '@ant-design/charts'
import ChartCard from '../components/ChartCard'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
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
            description="请求量最多的 Top 20 用户排名（含请求数、Token 消耗、费用），识别核心高价值用户"
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
            description="基于请求频率（≥100 次）和费用（≥$10）将用户分为四类：高频高价值、高频低价值、低频高价值、低频低价值"
          >
            <Pie
              data={rfm}
              angleField="user_count"
              colorField="quadrant"
              label={{ text: 'percentage', style: { fontSize: 10 } }}
            />
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
            description="各模型的 Token 消耗排名（区分 Prompt 和 Completion），了解模型级算力消耗分布"
          >
            <Column
              data={tokenRanking.flatMap(r => [
                { model_id: r.model_id, type: 'Prompt', tokens: r.total_prompt },
                { model_id: r.model_id, type: 'Completion', tokens: r.total_completion },
              ])}
              xField="model_id"
              yField="tokens"
              colorField="type"
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
            description="各模型的 Completion Token 产出排名（含请求数、平均产出长度），评估模型的内容生成效率"
          >
            <Column
              data={modelOutput}
              xField="model_id"
              yField="total_tokens"
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
            description="各渠道每美元产出的 Token 数（Tokens per Dollar），评估 AI 供应商的成本效益"
          >
            <Column
              data={channelEff}
              xField="channel_name"
              yField="tokens_per_dollar"
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
            description="各项目请求量和 Token 消耗的时间序列趋势，了解项目级的使用分布和变化"
          >
            <Line
              data={projectLines}
              xField="date"
              yField="value"
              colorField="project"
              axis={{ x: { title: 'Date' }, y: { title: 'Requests' } }}
            />
          </ChartCard>
        </Col>
      </Row>
    </Flex>
  )
}
