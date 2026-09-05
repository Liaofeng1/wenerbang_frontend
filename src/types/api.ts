export interface UserInfo {
  id: number
  username: string
  nickname: string
  school: string
  degree_tag: string
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
  filled_count: number
  status: 'open' | 'closed' | string
  target_degrees?: string[]
  created_at?: string
  publisher_nickname?: string
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
