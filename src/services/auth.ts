import { API_AUTH_LOGIN, API_AUTH_REGISTER, API_ME } from '@/constants/api'
import { request } from '@/services/request'
import type { AuthResult, UserInfo } from '@/types/api'

export function register(payload: {
  username: string
  password: string
  nickname?: string
  school?: string
  degree_tag: string
}) {
  return request<AuthResult>({
    url: API_AUTH_REGISTER,
    method: 'POST',
    data: payload,
    withAuth: false,
  })
}

export function login(payload: { username: string; password: string }) {
  return request<AuthResult>({
    url: API_AUTH_LOGIN,
    method: 'POST',
    data: payload,
    withAuth: false,
  })
}

export function fetchMe() {
  return request<UserInfo>({ url: API_ME })
}
