export type UserId = Readonly<{
  value: string
}>

export type User = Readonly<{
  nickname: UserId
  bio: string | null
}>
