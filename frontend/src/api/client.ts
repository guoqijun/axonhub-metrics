import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { message } from 'antd'

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    const msg = error.response?.data?.detail || error.message || 'Request failed'
    message.error(msg)
    return Promise.reject(error)
  },
)

export default client
