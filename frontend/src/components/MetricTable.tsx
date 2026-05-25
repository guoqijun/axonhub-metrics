import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface MetricTableProps<T> {
  columns: ColumnsType<T>
  dataSource: T[]
  loading?: boolean
  rowKey?: string | ((record: T, index?: number) => string)
}

export default function MetricTable<T extends object>({
  columns, dataSource, loading, rowKey = 'id',
}: MetricTableProps<T>) {
  return (
    <Table<T>
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey={rowKey as any}
      size="small"
      pagination={dataSource.length > 20 ? { pageSize: 20 } : false}
    />
  )
}
