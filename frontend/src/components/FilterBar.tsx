import { useEffect, useState } from 'react'
import { Card, DatePicker, Select, Space, Button } from 'antd'
import client from '../api/client'
import { useFilterStore } from '../hooks/useFilters'

const { RangePicker } = DatePicker

interface Option {
  id: number | string
  name?: string
  employee_id?: string | null
  employee_name?: string | null
  employee_org_name?: string | null
}

export default function FilterBar() {
  const {
    dateRange, granularity, userIds, channelIds, modelIds,
    setDateRange, setGranularity, setUserIds, setChannelIds, setModelIds, resetFilters,
  } = useFilterStore()

  const [users, setUsers] = useState<Option[]>([])
  const [channels, setChannels] = useState<Option[]>([])
  const [models, setModels] = useState<Option[]>([])

  useEffect(() => {
    client.get('/meta/users').then((res) => setUsers(res.data))
    client.get('/meta/channels').then((res) => setChannels(res.data))
    client.get('/meta/models').then((res) => setModels(res.data))
  }, [])

  return (
    <Card size="small" style={{ marginBottom: 0 }}>
      <Space wrap size="small">
        <RangePicker
          value={dateRange}
          onChange={(dates) => {
            if (dates?.[0] && dates?.[1]) {
              setDateRange([dates[0], dates[1]])
            }
          }}
        />
        <Select
          value={granularity}
          onChange={setGranularity}
          style={{ width: 100 }}
          options={[
            { value: 'day', label: '日' },
            { value: 'week', label: '周' },
            { value: 'month', label: '月' },
          ]}
        />
        <Select
          mode="multiple"
          placeholder="用户"
          value={userIds}
          onChange={setUserIds}
          style={{ minWidth: 150 }}
          allowClear
          showSearch
          options={users.map((u) => {
            const label = u.employee_name
              ? `${u.employee_name}${u.employee_org_name ? ` (${u.employee_org_name})` : ''}`
              : u.employee_id || `User #${u.id}`
            return { value: u.id as string, label }
          })}
          tagRender={(props) => {
            const { label, closable, onClose } = props
            return (
              <span style={{ marginRight: 4 }}>
                {label}
                {closable && <button className="filter-tag-close" onClick={onClose}>x</button>}
              </span>
            )
          }}
        />
        <Select
          mode="multiple"
          placeholder="渠道"
          value={channelIds}
          onChange={setChannelIds}
          style={{ minWidth: 150 }}
          allowClear
          showSearch
          options={channels.map((c) => ({
            value: c.id as number,
            label: c.name || `Channel #${c.id}`,
          }))}
        />
        <Select
          mode="multiple"
          placeholder="模型"
          value={modelIds}
          onChange={setModelIds}
          style={{ minWidth: 150 }}
          allowClear
          showSearch
          options={models.map((m) => ({
            value: m.id as string,
            label: m.name || m.id as string,
          }))}
        />
        <Button onClick={resetFilters}>重置</Button>
      </Space>
    </Card>
  )
}
