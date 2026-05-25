import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useAuthStore } from '../stores/auth'
import { login, initAdmin } from '../api/auth'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleLogin = async (username: string, password: string) => {
    setLoading(true)
    try {
      const res = await login(username, password)
      setAuth(res.token, username)
      message.success('Login successful')
      navigate('/', { replace: true })
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleInit = async (username: string, password: string) => {
    setLoading(true)
    try {
      const res = await initAdmin(username, password)
      setAuth(res.token, username)
      message.success('Admin initialized')
      navigate('/', { replace: true })
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return { loading, handleLogin, handleInit }
}
