export type LevelId = Readonly<{
  value: number
}>

export type Level = Readonly<{
  grade: LevelId
  title: string
  xpLevel: number
}>
