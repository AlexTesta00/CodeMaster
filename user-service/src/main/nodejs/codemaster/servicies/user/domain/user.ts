import { Option } from 'fp-ts/Option'

export type UserId = Readonly<{
  value: string
}>

export type User = Readonly<{
  nickname: UserId
  bio: Option<string>
}>
