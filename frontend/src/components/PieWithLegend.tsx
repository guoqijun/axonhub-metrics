import { Pie } from '@ant-design/charts'
import { Flex, Typography, Spin } from 'antd'
import { CHART_COLORS } from '../config/chartTheme'

const { Text } = Typography

interface PieDataItem {
  type: string
  value: number
}

interface PieWithLegendProps {
  data: PieDataItem[]
  loading?: boolean
  height?: number
  valueFormatter?: (v: number) => string
}

export default function PieWithLegend({
  data, loading, height = 280, valueFormatter,
}: PieWithLegendProps) {
  if (loading) {
    return <Flex align="center" justify="center" style={{ height }}><Spin tip="Loading..." /></Flex>
  }

  const fmt = valueFormatter ?? ((v: number) => v > 1000 ? v.toLocaleString() : String(v))

  return (
    <Flex gap={20} align="center" style={{ height }}>
      <div style={{ width: height, height, flexShrink: 0 }}>
        <Pie
          data={data}
          angleField="value"
          colorField="type"
          color={CHART_COLORS}
          legend={false}
        />
      </div>
      <div style={{ flex: 1, overflow: 'auto', maxHeight: height, paddingRight: 4 }}>
        {data.map((d, i) => (
          <Flex key={d.type} align="center" gap={8} style={{ padding: '3px 0' }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3,
              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              flexShrink: 0,
            }} />
            <Text style={{ flex: 1, fontSize: 13, lineHeight: '20px' }} ellipsis={{ tooltip: d.type }}>
              {d.type}
            </Text>
            <Text strong style={{ fontSize: 13, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(d.value)}
            </Text>
          </Flex>
        ))}
      </div>
    </Flex>
  )
}
