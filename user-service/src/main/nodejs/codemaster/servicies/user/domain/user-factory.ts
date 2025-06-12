import { User } from './user'
import { UserManager } from './user-manager'
import { Level } from './level'
import { ProfilePicture } from './profile-picture'
import { Language } from './language'
import { CV } from './cv'
import { Trophy } from './trophy'
import { checkNickname } from './validator'
import { createDefaultLevel } from './level-factory'
import { isSome, none, Option, some } from 'fp-ts/Option'
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
        userInfo: userInfo,
        profilePicture: some(profilePicture),
        languages: some(languages),
        cv: some(cv),
        trophies: some(trophies),
        level: level,
      })
    )
  )

export const createAdvancedUserOption = (
  nickname: string,
  bio: Option<string>,
  profilePicture: Option<ProfilePicture>,
  languages: Option<Iterable<Language>>,
  cv: Option<CV>,
  trophies: Option<Iterable<Trophy>>,
  level: Level
): Either<Error, UserManager> =>
  pipe(
    isSome(bio) ? createUserInfo(nickname, bio.value) : createDefaultUserInfo(nickname),
    chain((userInfo) =>
      right({
        userInfo: userInfo,
        profilePicture: profilePicture,
        languages: languages,
        cv: cv,
        trophies: trophies,
        level: level,
      })
    )
  )
