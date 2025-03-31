import { User } from './user'
import { UserManager } from './user-manager'
import { Level } from './level'
import { ProfilePicture } from './profile-picture'
import { Language } from './language'
import { CV } from './cv'
import { Trophy } from './trophy'
import { checkNickname } from './validator'
import { createDefaultLevel } from './level-factory'
import { none, some } from 'fp-ts/Option'
import { chain, Either, left, match, right, map } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export const createDefaultUserInfo = (nickname: string): Either<Error, User> =>
  pipe(
    nickname,
    checkNickname,
    match(
      (error) => left(error),
      () =>
        right({
          nickname: { value: nickname },
          bio: none,
        })
    )
  )

export const createUserInfo = (nickname: string, bio: string): Either<Error, User> =>
  pipe(
    nickname,
    checkNickname,
    match(
      (error) => left(error),
      () =>
        right({
          nickname: { value: nickname },
          bio: some(bio),
        })
    )
  )

export const createDefaultUser = (nickname: string): Either<Error, UserManager> =>
  pipe(
    createDefaultUserInfo(nickname),
    chain((defaultUserInfo) =>
      pipe(
        createDefaultLevel(),
        map((defaultLevel) => ({
          userInfo: defaultUserInfo,
          profilePicture: none,
          languages: none,
          cv: none,
          trophies: none,
          level: defaultLevel,
        }))
      )
    )
  )

export const createAdvancedUser = (
  nickname: string,
  bio: string,
  profilePicture: ProfilePicture,
  languages: Iterable<Language>,
  cv: CV,
  trophies: Iterable<Trophy>,
  level: Level
): Either<Error, UserManager> =>
  pipe(
    createUserInfo(nickname, bio),
    chain((userInfo) =>
      right({
        userInfo:
          userInfo.bio._tag === 'Some' && userInfo.bio.value != ''
            ? userInfo
            : { nickname: userInfo.nickname, bio: none },
        profilePicture: profilePicture.url != '' ? some(profilePicture) : none,
        languages: !languages[Symbol.iterator]().next().done ? some(languages) : none,
        cv: cv.url != '' ? some(cv) : none,
        trophies: !trophies[Symbol.iterator]().next().done ? some(trophies) : none,
        level,
      })
    )
  )
