import { API_COMPLETIONS_MINE, API_SURVEYS, API_SURVEYS_MINE } from '@/constants/api'
import { request } from '@/services/request'
import type { Completion, Survey } from '@/types/api'
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
  reward_points: number
  target_degrees: string[]
}) {
  return request<Survey>({
    url: API_SURVEYS,
    method: 'POST',
    data: payload,
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
