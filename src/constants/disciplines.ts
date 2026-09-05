/** 学术型学位 · 学科门类（学士 / 硕士 / 博士通用） */
export const ACADEMIC_DISCIPLINES = [
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

export type AcademicDiscipline = (typeof ACADEMIC_DISCIPLINES)[number]

/** 学术型学位层级 */
export const ACADEMIC_DEGREES = ['学士', '硕士', '博士'] as const

export type AcademicDegree = (typeof ACADEMIC_DEGREES)[number]
