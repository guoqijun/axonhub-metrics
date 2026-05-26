import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Typography, Flex } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  TrophyOutlined,
  DollarOutlined,
  WarningOutlined,
  NodeIndexOutlined,
  HeartOutlined,
  RiseOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../stores/auth'
import FilterBar from '../components/FilterBar'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '概览' },
  { key: '/adoption', icon: <TeamOutlined />, label: '推广覆盖度' },
  { key: '/usage', icon: <ApartmentOutlined />, label: '深度使用' },
  { key: '/value', icon: <TrophyOutlined />, label: '产出与价值' },
  { key: '/cost', icon: <DollarOutlined />, label: '成本分析' },
  { key: '/errors', icon: <WarningOutlined />, label: '错误分析' },
  { key: '/channels', icon: <NodeIndexOutlined />, label: '多渠道对比' },
  { key: '/health', icon: <HeartOutlined />, label: '系统健康度' },
  { key: '/growth', icon: <RiseOutlined />, label: '增长趋势' },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const username = useAuthStore((s) => s.username)
  const [collapsed, setCollapsed] = useState(false)

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
      >
        <Flex
          align="center"
          justify="center"
          style={{ height: 64, color: '#fff' }}
        >
          <Text strong style={{ color: '#fff', fontSize: collapsed ? 14 : 18 }}>
            {collapsed ? 'AH' : 'AxonHub Metrics'}
          </Text>
        </Flex>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Text>CodeV运营指标</Text>
          <Flex align="center" gap={12}>
            <Text type="secondary">{username}</Text>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              {collapsed ? '' : 'Logout'}
            </Button>
          </Flex>
        </Header>
        <Content style={{ margin: 16 }}>
          <FilterBar />
          <div style={{ marginTop: 16 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
