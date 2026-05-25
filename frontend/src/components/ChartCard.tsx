import { Card, Spin, Alert, Button, Empty, Flex, Typography, Tooltip, theme } from 'antd'
import { ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { useToken } = theme
const { Text } = Typography

interface ChartCardProps {
  title: string
  loading?: boolean
  error?: string | null
  empty?: boolean
  extra?: React.ReactNode
  onRetry?: () => void
  children: React.ReactNode
  height?: number
  description?: string
}

export default function ChartCard({
  title, loading = false, error = null, empty = false,
  extra, onRetry, children, height = 350, description,
}: ChartCardProps) {
  const { token } = useToken()

  const renderContent = () => {
    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ height }}>
          <Spin tip="Loading..." />
        </Flex>
      )
    }
    if (error) {
      return (
        <Alert
          type="error"
          message="Failed to load"
          description={error}
          showIcon
          action={
            onRetry && (
              <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
                Retry
              </Button>
            )
          }
          style={{ margin: 16 }}
        />
      )
    }
    if (empty) {
      return (
        <Flex align="center" justify="center" style={{ height }}>
          <Empty description="No data" />
        </Flex>
      )
    }
    return <div style={{ height }}>{children}</div>
  }

  return (
    <Card
      title={<Text strong>{title}{description && (
        <Tooltip title={description}>
          <InfoCircleOutlined className="info-icon" style={{ color: token.colorTextTertiary }} />
        </Tooltip>
      )}</Text>}
      extra={extra}
      size="small"
      className="hover-lift"
    >
      {renderContent()}
    </Card>
  )
}
