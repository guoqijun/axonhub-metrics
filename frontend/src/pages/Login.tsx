import { useState } from 'react'
import { Card, Form, Input, Button, Typography, Flex } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'

const { Title, Text } = Typography

export default function Login() {
  const { loading, handleLogin } = useAuth()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')

  const onSubmit = () => {
    if (!username || !password) return
    handleLogin(username, password)
  }

  return (
    <Flex
      style={{ minHeight: '100vh' }}
      align="center"
      justify="center"
    >
      <Card style={{ width: 400 }}>
        <Flex vertical align="center" gap={8} style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>AxonHub Metrics</Title>
          <Text type="secondary">CodeV运维分析平台</Text>
        </Flex>
        <Form layout="vertical" onFinish={onSubmit}>
          <Form.Item label="Username" required>
            <Input
              prefix={<UserOutlined />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </Form.Item>
          <Form.Item label="Password" required>
            <Input.Password
              prefix={<LockOutlined />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  )
}
