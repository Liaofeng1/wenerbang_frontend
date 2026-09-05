export interface UserInfo {
  id: number
  username: string
  nickname: string
  school: string
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
  filled_count: number
  status: 'open' | 'closed' | string
  created_at?: string
  publisher_nickname?: string
  avg_fill_seconds?: number
  estimated_reward?: number
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

export interface ApiResponse<T> {
  data?: T
  error?: string
}
