import { createUser, User } from './user'
import { Either, map } from 'fp-ts/Either'
import { Error } from 'mongoose'
import { pipe } from 'fp-ts/function'

export type UserManager = Readonly<{
  info: User
  banned: boolean
  refreshToken: string
}>

export const createUserManager = (
  nickname: string,
  email: string,
  password: string,
  role: 'admin' | 'user',
  banned: boolean
): Either<Error, UserManager> =>
  pipe(
    createUser(nickname, email, password, role),
    map((user) => ({
      info: user,
      banned: banned,
      refreshToken: '',
    }))
  )
