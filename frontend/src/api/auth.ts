import client from './client'

export interface LoginResponse {
  token: string
  expire_hours: number
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await client.post('/auth/login', { username, password })
  return data
}

export async function initAdmin(username: string, password: string): Promise<LoginResponse> {
  const { data } = await client.post('/auth/init', { username, password })
  return data
}
