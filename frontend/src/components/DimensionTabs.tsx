import { Segmented } from 'antd'

interface DimensionTabsProps {
  dimensions: string[]
  activeKey: string
  onChange: (key: string) => void
}

export default function DimensionTabs({ dimensions, activeKey, onChange }: DimensionTabsProps) {
  const options = dimensions.map((d) => ({ value: d, label: d }))
  return (
    <Segmented
      value={activeKey}
      options={options}
      onChange={(val) => onChange(val as string)}
      size="small"
    />
  )
}
