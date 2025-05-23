import { chain, Either, fromPredicate, map } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export type UserId = Readonly<{
  value: string
}>

export type Role = Readonly<{
  name: 'admin' | 'user'
}>

export type User = Readonly<{
  nickname: UserId
  email: string
  password: string
  role: Role
}>

const nicknameRegEx: RegExp = /^[a-zA-Z0-9_]{3,10}$/
const emailRegEx: RegExp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
const passwordRegEx: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/

export const validateNickname = (nickname: string) =>
  fromPredicate(
    (nickname: string) => nicknameRegEx.test(nickname),
    () =>
      new Error(
        'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
      )
  )(nickname)

export const validateEmail = (email: string) =>
  fromPredicate(
    (email: string) => emailRegEx.test(email),
    () => new Error('Invalid email format')
  )(email)

export const validatePassword = (password: string) =>
  fromPredicate(
    (password: string) => passwordRegEx.test(password),
    () =>
      new Error(
        'Invalid password format, at least 8 characters, one uppercase letter, one number and one special character'
      )
  )(password)

export const createUser = (
  nickname: string,
  email: string,
  password: string,
  role: 'admin' | 'user'
): Either<Error, User> =>
  pipe(
    validateNickname(nickname),
    chain(() => validateEmail(email)),
    chain(() => validatePassword(password)),
    map(() => ({
      nickname: { value: nickname },
      email,
      password,
      role: { name: role },
    }))
  )
