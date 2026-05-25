import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Flex } from 'antd'
import { Column, Line } from '@ant-design/charts'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import MetricTable from '../components/MetricTable'
import { useFilterStore } from '../hooks/useFilters'
import {
  fetchDAUMauTrend, fetchUsageRatio, fetchNewUserTrend,
  fetchChannelActiveUsers, fetchModelUserCount,
  fetchActivityHeatmap, fetchProjectRanking, fetchUserPenetration,
  type DAUMauPoint, type UsageRatio, type ProjectRanking,
  type ChannelActiveUsers, type ModelUserCount, type ActivityHeatmapPoint,
  type UserPenetration,
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

  useEffect(() => { loadUsageRatio() }, [loadUsageRatio])
  useEffect(() => { loadDauMau() }, [loadDauMau])
  useEffect(() => { loadNewUser() }, [loadNewUser])
  useEffect(() => { loadChannelUsers() }, [loadChannelUsers])
  useEffect(() => { loadModelUsers() }, [loadModelUsers])
  useEffect(() => { loadHeatmap() }, [loadHeatmap])
  useEffect(() => { loadProjects() }, [loadProjects])
  useEffect(() => { loadPenetration() }, [loadPenetration])

  // Transform heatmap for chart: merge same hour across days
  const heatmapData = heatmap.map(p => ({
    ...p,
    day_label: DAY_NAMES[p.day_of_week] || `Day${p.day_of_week}`,
  }))

  // Latest DAU/MAU from trend data
  const latest = dauMau.length > 0 ? dauMau[dauMau.length - 1] : null

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
          />
        </Col>
        <Col xs={12} sm={8}>
          <KPICard
            title="月活跃用户 (MAU)"
            value={latest?.mau ?? 0}
            suffix="users"
            precision={0}
            loading={dauMauLoading}
          />
        </Col>
        <Col xs={12} sm={8}>
          <KPICard
            title="活跃用户"
            value={usageRatio?.active_users ?? 0}
            suffix="users"
            precision={0}
            loading={usageRatioLoading}
          />
        </Col>
        <Col xs={12} sm={8}>
          <KPICard
            title="总注册用户"
            value={usageRatio?.total_users ?? 0}
            suffix="users"
            precision={0}
            loading={usageRatioLoading}
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
          >
            <Line
              data={dauMau.flatMap(d => [
                { date: d.date, type: 'DAU', value: d.dau },
                { date: d.date, type: 'MAU', value: d.mau },
              ]).filter(d => d.value > 0)}
              xField="date"
              yField="value"
              colorField="type"
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
          >
            <Column
              data={newUser}
              xField="date"
              yField="value"
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
          >
            <Column
              data={channelUsers}
              xField="channel_name"
              yField="active_users"
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
          >
            <Column
              data={modelUsers}
              xField="model_id"
              yField="user_count"
              axis={{ x: { title: 'Model', labelAutoHide: true }, y: { title: 'Users' } }}
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Charts Row 3 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="活跃度热力图"
            loading={heatmapLoading}
            error={heatmapError}
            empty={heatmapData.length === 0 && !heatmapLoading && !heatmapError}
            onRetry={loadHeatmap}
          >
            <Column
              data={heatmapData}
              xField="hour"
              yField="user_count"
              colorField="day_label"
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
