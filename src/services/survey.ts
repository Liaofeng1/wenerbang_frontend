import { API_COMPLETIONS_MINE, API_SURVEYS, API_SURVEYS_MINE } from '@/constants/api'
import { request } from '@/services/request'
import type { Completion, Survey, SurveyStats } from '@/types/api'
import type { SurveySession } from '@/types/session'

export function listSurveys() {
  return request<Survey[]>({ url: API_SURVEYS })
}

export function listMySurveys() {
  return request<Survey[]>({ url: API_SURVEYS_MINE })
}

export function createSurvey(payload: {
  title: string
  link: string
  description?: string
  target_count: number
  min_fill_seconds: number
  expected_fill_seconds: number
  bounty_count: number
  bounty_per: number
  pin_hours: number
  target_school: string
  target_major: string
  target_gender: string
  target_audience_count: number
  target_genders?: string[]
  target_regions?: string[]
  target_city_tiers?: string[]
}) {
  return request<Survey>({
    url: API_SURVEYS,
    method: 'POST',
    data: payload,
  })
}

export function getSurveyStats(id: number) {
  return request<SurveyStats>({
    url: `${API_SURVEYS}/${id}/stats`,
  })
}

export function startSurvey(id: number) {
  return request<SurveySession>({
    url: `${API_SURVEYS}/${id}/start`,
    method: 'POST',
  })
}

export function leaveSurvey(id: number) {
  return request<SurveySession>({
    url: `${API_SURVEYS}/${id}/leave`,
    method: 'POST',
  })
}

export function returnSurvey(id: number) {
  return request<SurveySession>({
    url: `${API_SURVEYS}/${id}/return`,
    method: 'POST',
  })
}

export function getSurveySession(id: number) {
  return request<SurveySession>({
    url: `${API_SURVEYS}/${id}/session`,
  })
}

export function completeSurvey(id: number) {
  return request<Completion>({
    url: `${API_SURVEYS}/${id}/complete`,
    method: 'POST',
  })
}

export function listMyCompletions() {
  return request<Completion[]>({ url: API_COMPLETIONS_MINE })
}
