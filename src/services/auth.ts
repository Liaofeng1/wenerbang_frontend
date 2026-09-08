import { API_AUTH_LOGIN, API_AUTH_REGISTER, API_AUTH_SEND_CODE, API_AUTH_VERIFY_CODE, API_ME, API_ME_CHECKIN } from '@/constants/api'
import { request } from '@/services/request'
import type { AuthResult, UserInfo } from '@/types/api'

export function register(payload: {
  username: string
  password: string
  email: string
  nickname?: string
  school?: string
  major?: string
  gender: string
  region: string
  city_tier: string
  invite_code?: string
}) {
  return request<AuthResult>({
    url: API_AUTH_REGISTER,
    method: 'POST',
    data: payload,
    withAuth: false,
  })
}

export function sendEmailCode(email: string) {
  return request<{ message: string }>({
    url: API_AUTH_SEND_CODE,
    method: 'POST',
    data: { email },
    withAuth: false,
  })
}

export function verifyEmailCode(email: string, code: string) {
  return request<{ message: string }>({
    url: API_AUTH_VERIFY_CODE,
    method: 'POST',
    data: { email, code },
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

export function updateMe(payload: {
  nickname: string
  school: string
  major: string
  gender: string
  region?: string
  city_tier?: string
}) {
  return request<UserInfo>({
    url: API_ME,
    method: 'PATCH',
    data: payload,
  })
}

export function checkIn() {
  return request<UserInfo>({
    url: API_ME_CHECKIN,
    method: 'POST',
  })
}