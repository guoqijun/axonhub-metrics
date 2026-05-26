import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line } from '@ant-design/charts'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
import { CHART_COLORS, CHART_PRIMARY } from '../config/chartTheme'
import {
  fetchDAUMauTrend, fetchUsageRatio, fetchNewUserTrend,
  fetchChannelActiveUsers, fetchModelUserCount,
  fetchActivityHeatmap, fetchProjectRanking, fetchUserPenetration,
  fetchOrgUserDistribution,
  type DAUMauPoint, type UsageRatio, type ProjectRanking,
  type ChannelActiveUsers, type ModelUserCount, type ActivityHeatmapPoint,
  type UserPenetration, type OrgUserDistribution,
} from '../api/metrics'
import type { TrendPoint } from '../api/metrics'

const DAY_NAMES: Record<number, string> = { 1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat' }

export default function Adoption() {
  const filters = useFilterStore()

  const [usageRatio, setUsageRatio] = useState<UsageRatio | null>(null)
  const [usageRatioLoading, setUsageRatioLoading] = useState(false)

  const [dauMau, setDauMau] = useState<DAUMauPoint[]>([])
  const [dauMauLoading, setDauMauLoading] = useState(false)
  const [dauMauError, setDauMauError] = useState<string | null>(null)

  const [newUser, setNewUser] = useState<TrendPoint[]>([])
  const [newUserLoading, setNewUserLoading] = useState(false)
  const [newUserError, setNewUserError] = useState<string | null>(null)

  const [channelUsers, setChannelUsers] = useState<ChannelActiveUsers[]>([])
  const [channelUsersLoading, setChannelUsersLoading] = useState(false)
  const [channelUsersError, setChannelUsersError] = useState<string | null>(null)

  const [modelUsers, setModelUsers] = useState<ModelUserCount[]>([])
  const [modelUsersLoading, setModelUsersLoading] = useState(false)
  const [modelUsersError, setModelUsersError] = useState<string | null>(null)

  const [heatmap, setHeatmap] = useState<ActivityHeatmapPoint[]>([])
  const [heatmapLoading, setHeatmapLoading] = useState(false)
  const [heatmapError, setHeatmapError] = useState<string | null>(null)

  const [projects, setProjects] = useState<ProjectRanking[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectsError, setProjectsError] = useState<string | null>(null)

  const [penetration, setPenetration] = useState<UserPenetration | null>(null)
  const [penetrationLoading, setPenetrationLoading] = useState(false)

  const [orgDist, setOrgDist] = useState<OrgUserDistribution[]>([])
  const [orgDistLoading, setOrgDistLoading] = useState(false)
  const [orgDistError, setOrgDistError] = useState<string | null>(null)

  const loadUsageRatio = useCallback(async () => {
    setUsageRatioLoading(true)
    try {
      const data = await fetchUsageRatio(filters)
      setUsageRatio(data)
    } catch { /* silent */ }
    finally { setUsageRatioLoading(false) }
  }, [filters])

  const loadDauMau = useCallback(async () => {
    setDauMauLoading(true)
    setDauMauError(null)
    try { setDauMau(await fetchDAUMauTrend(filters)) }
    catch (e: any) { setDauMauError(e.message) }
    finally { setDauMauLoading(false) }
  }, [filters])

  const loadNewUser = useCallback(async () => {
    setNewUserLoading(true)
    setNewUserError(null)
    try { setNewUser(await fetchNewUserTrend(filters)) }
    catch (e: any) { setNewUserError(e.message) }
    finally { setNewUserLoading(false) }
  }, [filters])

  const loadChannelUsers = useCallback(async () => {
    setChannelUsersLoading(true)
    setChannelUsersError(null)
    try { setChannelUsers(await fetchChannelActiveUsers(filters)) }
    catch (e: any) { setChannelUsersError(e.message) }
    finally { setChannelUsersLoading(false) }
  }, [filters])

  const loadModelUsers = useCallback(async () => {
    setModelUsersLoading(true)
    setModelUsersError(null)
    try { setModelUsers(await fetchModelUserCount(filters)) }
    catch (e: any) { setModelUsersError(e.message) }
    finally { setModelUsersLoading(false) }
  }, [filters])

  const loadHeatmap = useCallback(async () => {
    setHeatmapLoading(true)
    setHeatmapError(null)
    try { setHeatmap(await fetchActivityHeatmap(filters)) }
    catch (e: any) { setHeatmapError(e.message) }
    finally { setHeatmapLoading(false) }
  }, [filters])

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true)
    setProjectsError(null)
    try { setProjects(await fetchProjectRanking(filters)) }
    catch (e: any) { setProjectsError(e.message) }
    finally { setProjectsLoading(false) }
  }, [filters])

  const loadPenetration = useCallback(async () => {
    setPenetrationLoading(true)
    try {
      const data = await fetchUserPenetration(filters)
      setPenetration(data)
    } catch { /* silent */ }
    finally { setPenetrationLoading(false) }
  }, [filters])

  const loadOrgDist = useCallback(async () => {
    setOrgDistLoading(true); setOrgDistError(null)
    try { setOrgDist(await fetchOrgUserDistribution(filters)) }
    catch (e: any) { setOrgDistError(e.message) }
    finally { setOrgDistLoading(false) }
  }, [filters])

  useEffect(() => { loadUsageRatio() }, [loadUsageRatio])
  useEffect(() => { loadDauMau() }, [loadDauMau])
  useEffect(() => { loadNewUser() }, [loadNewUser])
  useEffect(() => { loadChannelUsers() }, [loadChannelUsers])
  useEffect(() => { loadModelUsers() }, [loadModelUsers])
  useEffect(() => { loadHeatmap() }, [loadHeatmap])
  useEffect(() => { loadProjects() }, [loadProjects])
  useEffect(() => { loadPenetration() }, [loadPenetration])
  useEffect(() => { loadOrgDist() }, [loadOrgDist])

  // Transform heatmap for chart: merge same hour across days
  const heatmapData = heatmap.map(p => ({
    ...p,
    day_label: DAY_NAMES[p.day_of_week] || `Day${p.day_of_week}`,
  }))

  // Latest DAU/MAU from trend data
  const latest = dauMau.length > 0 ? dauMau[dauMau.length - 1] : null

  const orgPieData = orgDist.map(d => ({ type: d.employee_org_name ?? '', value: d.user_count }))

  return (
    <Flex vertical gap={16}>
      {/* KPI Row: 日活/月活 + 推广覆盖指标 */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8}>
          <KPICard
            title="日活跃用户 (DAU)"
            value={latest?.dau ?? 0}
            suffix="users"
            precision={0}
            loading={dauMauLoading}
            description={<><b>指标含义：</b>当日至少成功发起一次 API 请求的去重用户数<br /><b>业务意义：</b>DAU 是衡量平台日常活跃度的核心指标，反映产品的用户粘性和日常使用频率<br /><b>计算逻辑：</b>COUNT(DISTINCT employee_id)，筛选当日有 usage_logs 记录的用户<br /><b>补充说明：</b>DAU 受工作日/节假日影响明显，建议按周同比分析</>}
          />
        </Col>
        <Col xs={12} sm={8}>
          <KPICard
            title="月活跃用户 (MAU)"
            value={latest?.mau ?? 0}
            suffix="users"
            precision={0}
            loading={dauMauLoading}
            description={<><b>指标含义：</b>近 30 天（滚动窗口）至少成功发起一次 API 请求的去重用户数<br /><b>业务意义：</b>MAU 反映平台的月活规模和用户基础广度，是衡量产品市场覆盖的关键指标<br /><b>计算逻辑：</b>COUNT(DISTINCT employee_id)，筛选近 30 天有请求记录的用户<br /><b>补充说明：</b>MAU 可用于计算 DAU/MAU 比值（用户粘性指标），比值越高说明用户使用频率越高</>}
          />
        </Col>
        <Col xs={12} sm={8}>
          <KPICard
            title="活跃用户"
            value={usageRatio?.active_users ?? 0}
            suffix="users"
            precision={0}
            loading={usageRatioLoading}
            description={<><b>指标含义：</b>在当前筛选的时间范围内，至少发起过一次 API 请求的去重用户数<br /><b>业务意义：</b>反映在指定时间范围内的活跃用户规模，与总注册用户对比可评估活跃率<br /><b>计算逻辑：</b>COUNT(DISTINCT employee_id)，按所选时间范围筛选 usage_logs<br /><b>补充说明：</b>时间段选择会影响数值，建议固定周期（如近 7 天/30 天）观察趋势</>}
          />
        </Col>
        <Col xs={12} sm={8}>
          <KPICard
            title="总注册用户"
            value={usageRatio?.total_users ?? 0}
            suffix="users"
            precision={0}
            loading={usageRatioLoading}
            description={<><b>指标含义：</b>平台所有曾出现过的去重用户总数，基于 api_keys 表中的 employee_id 统计<br /><b>业务意义：</b>反映平台的累计用户规模和推广覆盖成果，是用户增长的基础指标<br /><b>计算逻辑：</b>COUNT(DISTINCT api_keys.employee_id)，统计所有出现过请求记录的用户<br /><b>补充说明：</b>总注册用户是存量指标，持续增长说明平台推广有效；结合活跃用户可计算使用率</>}
          />
        </Col>
        <Col xs={12} sm={8}>
          <KPICard
            title="使用比例"
            value={usageRatio ? (usageRatio.ratio * 100) : 0}
            suffix="%"
            precision={1}
            loading={usageRatioLoading}
            trend={usageRatio && usageRatio.ratio > 0.5 ? 'up' : usageRatio ? 'down' : null}
            trendValue={usageRatio ? `${(usageRatio.ratio * 100).toFixed(1)}%` : undefined}
            description={<><b>指标含义：</b>活跃用户数占总注册用户数的百分比，衡量用户转化效率<br /><b>业务意义：</b>反映平台用户的活跃转化率，评估推广效果和产品价值。比例越高说明用户越认可产品<br /><b>计算逻辑：</b>活跃用户 ÷ 总注册用户 × 100%。活跃用户为筛选时间内有请求的用户，总注册用户为累计用户<br /><b>补充说明：</b>一般 SaaS 产品的使用比例在 30%-60% 之间，低于 20% 需要关注用户激活和 onboarding 流程</>}
          />
        </Col>
        <Col xs={12} sm={8}>
          <KPICard
            title="用户渗透率"
            value={penetration ? (penetration.penetration_rate * 100) : 0}
            suffix="%"
            precision={1}
            loading={penetrationLoading}
            trend={penetration && penetration.penetration_rate > 0.3 ? 'up' : penetration ? 'down' : null}
            trendValue={penetration ? `${(penetration.penetration_rate * 100).toFixed(1)}%` : undefined}
            description={<><b>指标含义：</b>重度用户（使用天数 &gt; 5 天）占总注册用户的比例<br /><b>业务意义：</b>反映产品对用户的粘性和上瘾程度。渗透率越高说明用户已将产品融入日常工作流，形成使用习惯<br /><b>计算逻辑：</b>COUNT(使用天数 &gt; 5 天的用户) ÷ 总注册用户 × 100%。使用天数指用户在统计周期内有请求的天数<br /><b>补充说明：</b>重度用户是产品的核心价值用户，应重点维护。该指标与产品类型相关，工具类产品通常渗透率较高</>}
          />
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="DAU/MAU 趋势"
            loading={dauMauLoading}
            error={dauMauError}
            empty={dauMau.length === 0 && !dauMauLoading && !dauMauError}
            onRetry={loadDauMau}
            description={<><b>指标含义：</b>DAU 和 MAU 在时间轴上的变化曲线对比<br /><b>业务意义：</b>评估用户粘性和平台健康度。DAU/MAU 比值可计算用户粘性系数<br /><b>计算逻辑：</b>DAU 按日 COUNT DISTINCT employee_id，MAU 按 30 天滚动窗口 COUNT DISTINCT employee_id<br /><b>补充说明：</b>DAU/MAU 比值（Stickiness）通常在 10%-25% 之间，越高说明用户使用频率越高</>}
          >
            <Line
              data={dauMau.flatMap(d => [
                { date: d.date, type: 'DAU', value: d.dau },
                { date: d.date, type: 'MAU', value: d.mau },
              ]).filter(d => d.value > 0)}
              xField="date"
              yField="value"
              colorField="type"
              color={CHART_COLORS}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="新用户注册趋势"
            loading={newUserLoading}
            error={newUserError}
            empty={newUser.length === 0 && !newUserLoading && !newUserError}
            onRetry={loadNewUser}
            description={<><b>指标含义：</b>每日新用户的增长趋势，新用户定义为首次在 usage_logs 中出现请求记录的用户<br /><b>业务意义：</b>反映平台的拉新速度和市场扩展效果，评估推广活动的获客效率<br /><b>计算逻辑：</b>按用户首次出现日期 GROUP BY，COUNT 每个日期首次出现的用户数。即 MIN(created_at) 为首次出现日<br /><b>补充说明：</b>新用户数受营销活动影响大，建议结合推广时间点分析峰值原因</>}
          >
            <Column
              data={newUser}
              xField="date"
              yField="value"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Date' }, y: { title: 'New Users' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="各渠道活跃用户"
            loading={channelUsersLoading}
            error={channelUsersError}
            empty={channelUsers.length === 0 && !channelUsersLoading && !channelUsersError}
            onRetry={loadChannelUsers}
            description={<><b>指标含义：</b>按 AI 供应商渠道分组，统计每个渠道的去重用户数<br /><b>业务意义：</b>了解不同 AI 供应商覆盖的用户群体规模，评估渠道的市场渗透和用户偏好<br /><b>计算逻辑：</b>按 channel_id GROUP BY，COUNT(DISTINCT employee_id)，统计每个渠道的独立用户数<br /><b>补充说明：</b>用户可能在多个渠道都有使用，各渠道用户数之和可能大于总活跃用户数</>}
          >
            <Column
              data={channelUsers}
              xField="channel_name"
              yField="active_users"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Channel' }, y: { title: 'Active Users' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="各模型使用用户数"
            loading={modelUsersLoading}
            error={modelUsersError}
            empty={modelUsers.length === 0 && !modelUsersLoading && !modelUsersError}
            onRetry={loadModelUsers}
            description={<><b>指标含义：</b>按模型 ID 分组，统计使用每个模型的去重用户数<br /><b>业务意义：</b>了解不同模型的用户覆盖度和受欢迎程度，指导模型选型和推广策略<br /><b>计算逻辑：</b>按 model_id GROUP BY，COUNT(DISTINCT employee_id)，统计每个模型的独立用户数<br /><b>补充说明：</b>用户可能使用多个模型，各模型用户数之和可能大于总活跃用户数</>}
          >
            <Column
              data={modelUsers}
              xField="model_id"
              yField="user_count"
              color={CHART_PRIMARY}
              axis={{ x: { title: 'Model', labelAutoHide: true }, y: { title: 'Users' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Charts Row 3 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="用户组织分布"
            loading={orgDistLoading}
            error={orgDistError}
            empty={orgDist.length === 0 && !orgDistLoading && !orgDistError}
            onRetry={loadOrgDist}
            description={<><b>指标含义：</b>按员工所属组织（employee_org_name）分组的活跃用户数分布<br /><b>业务意义：</b>了解平台的用户来自哪些组织，评估各组织的采用率和推广覆盖效果<br /><b>计算逻辑：</b>按 employee_org_name GROUP BY，COUNT(DISTINCT employee_id)，统计每个组织的去重活跃用户数<br /><b>补充说明：</b>组织分布越分散说明平台覆盖范围越广，若集中在少数组织说明推广仍有拓展空间</>}
          >
            <Column
              data={orgPieData}
              xField="type"
              yField="value"
              color={CHART_PRIMARY}
              axis={{ x: { title: '组织', labelAutoHide: true }, y: { title: '用户数' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="活跃度热力图"
            loading={heatmapLoading}
            error={heatmapError}
            empty={heatmapData.length === 0 && !heatmapLoading && !heatmapError}
            onRetry={loadHeatmap}
            description={<><b>指标含义：</b>一周内每一天的各小时段的用户活跃数量分布（星期 × 小时交叉维度）<br /><b>业务意义：</b>发现用户使用的高峰时段和低谷时段，指导运营投放、系统维护窗口选择和资源弹性策略<br /><b>计算逻辑：</b>按 day_of_week 和 hour 分组，COUNT(DISTINCT employee_id)，展示二维交叉分布<br /><b>补充说明：</b>可据此优化客服排班、系统维护时间（选低谷时段）、以及营销活动的投放时机</>}
          >
            <Column
              data={heatmapData}
              xField="hour"
              yField="user_count"
              colorField="day_label"
              color={CHART_COLORS}
              axis={{ x: { title: 'Hour' }, y: { title: 'Active Users' } }}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="项目活跃度排名"
            loading={projectsLoading}
            error={projectsError}
            empty={projects.length === 0 && !projectsLoading && !projectsError}
            onRetry={loadProjects}
            description={<><b>指标含义：</b>各项目的总请求量和活跃用户数的排名列表<br /><b>业务意义：</b>了解哪些项目使用量最大、用户数最多，评估项目的推广效果和资源投入合理性<br /><b>计算逻辑：</b>按项目分组，COUNT(*) 统计请求量，COUNT(DISTINCT employee_id) 统计用户数，按请求量降序排列<br /><b>补充说明：</b>结合请求量和用户数两个维度，可判断项目是"少人多用"还是"人多均用"</>}
          >
            <MetricTable
              dataSource={projects}
              rowKey="project_name"
              columns={[
                { key: 'project_name', title: '项目', render: (r) => r.project_name || '-' },
                { key: 'request_count', title: '请求量' },
                { key: 'user_count', title: '用户数' },
              ]}
              loading={projectsLoading}
            />
          </ChartCard>
        </Col>
      </Row>
    </Flex>
  )
}
