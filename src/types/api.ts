export interface UserInfo {
  id: number
  username: string
  nickname: string
  school: string
  major?: string
  gender?: string
  region?: string
  city_tier?: string
  invite_code: string
  invited_by_id?: number | null
  points: number
  created_at?: string
}

export interface AuthResult {
  token: string
  user: UserInfo
}

export interface Survey {
  id: number
  publisher_id: number
  title: string
  link: string
  description: string
  target_count: number
  reward_points: number
  min_fill_seconds: number
  expected_fill_seconds: number
  bounty_count: number
  bounty_per: number
  bounty_remain: number
  frozen_bounty: number
  pin_hours: number
  pin_until?: string | null
  target_school: string
  target_major: string
  target_gender: string
  target_audience_count: number
  targeting_reached: number
  filled_count: number
  status: 'open' | 'closed' | string
  target_genders?: string[]
  target_regions?: string[]
  target_city_tiers?: string[]
  created_at?: string
  publisher_nickname?: string
  avg_fill_seconds?: number
  estimated_reward?: number
  is_pinned?: boolean
  pin_by_bounty?: boolean
  pin_by_paid?: boolean
}

export interface Completion {
  id: number
  survey_id: number
  user_id: number
  points_earned: number
  away_seconds?: number
  created_at?: string
  survey_title?: string
}

export interface CompletionDetail {
  user_id: number
  nickname: string
  gender: string
  region: string
  city_tier: string
  school: string
  away_seconds: number
  completed_at: string
}

export interface SurveyStats {
  survey_id: number
  title: string
  status: string
  filled_count: number
  target_count: number
  min_fill_seconds: number
  min_away_seconds: number
  gender_counts: Record<string, number>
  region_counts: Record<string, number>
  city_tier_counts: Record<string, number>
  avg_away_seconds: number
  completions: CompletionDetail[]
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
