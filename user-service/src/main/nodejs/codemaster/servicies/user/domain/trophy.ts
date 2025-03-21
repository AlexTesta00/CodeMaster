export type TrophyId = Readonly<{
  value: string
}>

export type Trophy = Readonly<{
  title: TrophyId
  description: string
  url: string
  xp: number
}>
