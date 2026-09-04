import type { ApiResponse } from '@/types/api'
import { useUserStore } from '@/stores/user'
import router from '@/router'

function resolveUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  if (!base) return path
  return `${base.replace(/\/$/, '')}${path}`
}

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: unknown
  withAuth?: boolean
}

export async function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, withAuth = true } = options
  const userStore = useUserStore()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (withAuth && userStore.token) {
    headers.Authorization = `Bearer ${userStore.token}`
  }

  const res = await fetch(resolveUrl(url), {
    method,
    headers,
    body: data === undefined ? undefined : JSON.stringify(data),
  })

  let payload: ApiResponse<T> = {}
  try {
    payload = (await res.json()) as ApiResponse<T>
  } catch {
    throw new Error('服务响应异常')
  }

  if (res.status === 401) {
    userStore.logout()
    router.push({ name: 'login' })
    throw new Error(payload.error || '未登录')
  }
  if (!res.ok || payload.error) {
    throw new Error(payload.error || `请求失败(${res.status})`)
  }
  return payload.data as T
}
