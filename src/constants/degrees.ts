/** 学术型学位 · 学科门类（不区分本硕博） */
export const DEGREE_TAGS = [
  '哲学',
  '经济学',
  '法学',
  '教育学',
  '文学',
  '历史学',
  '理学',
  '工学',
  '农学',
  '医学',
  '军事学',
  '管理学',
  '艺术学',
] as const

export type DegreeTag = (typeof DEGREE_TAGS)[number]
