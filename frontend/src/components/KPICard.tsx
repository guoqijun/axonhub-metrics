import { Card, Statistic, Flex, Tooltip } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons'

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
  return (
    <Card loading={loading} hoverable>
      <Statistic
        title={
          <span>
            {title}
            {description && (
              <Tooltip title={description}>
                <InfoCircleOutlined style={{ marginLeft: 6, color: '#8c8c8c', fontSize: 13, cursor: 'help' }} />
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
            <ArrowUpOutlined style={{ color: '#52c41a' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
          )}
          <span style={{ fontSize: 12, color: trend === 'up' ? '#52c41a' : '#ff4d4f' }}>
            {trendValue}
          </span>
        </Flex>
      )}
    </Card>
  )
}
