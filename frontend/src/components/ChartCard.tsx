import { Card, Spin, Alert, Button, Empty, Flex, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

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
}

export default function ChartCard({
  title, loading = false, error = null, empty = false,
  extra, onRetry, children, height = 350,
}: ChartCardProps) {
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
      title={<Text strong>{title}</Text>}
      extra={extra}
      size="small"
    >
      {renderContent()}
    </Card>
  )
}
