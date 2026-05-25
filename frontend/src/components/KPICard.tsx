import { Card, Statistic, Flex, Tooltip, theme } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { useToken } = theme

interface KPICardProps {
  title: string
  value: number | string
  prefix?: string
  suffix?: string
  precision?: number
  trend?: 'up' | 'down' | null
  trendValue?: string
  loading?: boolean
  description?: string
}

export default function KPICard({
  title, value, prefix, suffix, precision = 2, trend, trendValue, loading, description,
}: KPICardProps) {
  const { token } = useToken()

  return (
    <Card loading={loading} hoverable className="hover-lift" style={{ height: '100%' }} styles={{ body: { display: 'flex', flexDirection: 'column', justifyContent: 'center' } }}>
      <Statistic
        title={
          <span>
            {title}
            {description && (
              <Tooltip title={description}>
                <InfoCircleOutlined className="info-icon" style={{ color: token.colorTextTertiary }} />
              </Tooltip>
            )}
          </span>
        }
        value={value}
        precision={typeof value === 'number' ? precision : undefined}
        prefix={prefix}
        suffix={suffix}
      />
      {trend && (
        <Flex align="center" gap={4} style={{ marginTop: 8 }}>
          {trend === 'up' ? (
            <ArrowUpOutlined style={{ color: token.colorSuccess }} />
          ) : (
            <ArrowDownOutlined style={{ color: token.colorError }} />
          )}
          <span style={{ fontSize: 12, color: trend === 'up' ? token.colorSuccess : token.colorError }}>
            {trendValue}
          </span>
        </Flex>
      )}
    </Card>
  )
}
