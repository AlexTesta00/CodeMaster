import { Either, left, right } from 'fp-ts/Either'
import { Error } from 'mongoose'

const nicknameRegEx: RegExp = /^[a-zA-Z0-9_]{3,10}$/
const urlRexEx: RegExp = /^(http|https):\/\/[^ "]+$/

export const checkNickname = (nickname: string): Either<Error, string> =>
  nicknameRegEx.test(nickname)
    ? right(nickname)
    : left(
        new Error(
          'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
        )
      )

export const checkUrl = (url: string): Either<Error, string> =>
  urlRexEx.test(url) ? right(url) : left(new Error('Invalid URL format'))
