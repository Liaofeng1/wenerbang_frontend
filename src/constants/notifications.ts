export interface Notification {
  id: number
  title: string
  content: string
  date: string
}

export const notifications: Notification[] = [
  {
    id: 1,
    title: '💰 注册奖励增加',
    content: '新用户注册奖励由50积分增加到150积分，老用户已自动补全差额，请查收!',
    date: '2026-09-21',
  }
]