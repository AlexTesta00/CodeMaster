import { User } from './user'
import { UserManager } from './user-manager'
import { Level } from './level'
import { ProfilePicture } from './profile-picture'
import { Language } from './language'
import { CV } from './cv'
import { Trophy } from './trophy'
import { checkNicknameOrThrowError, checkUrlOrThrowError } from './validator'
import { createDefaultLevel } from './level-factory'
import { none, some } from 'fp-ts/Option'

export const createDefaultUserInfo = (nickname: string): User => {
  checkNicknameOrThrowError(nickname)
  return {
    nickname: { value: nickname },
    bio: none,
  }
}

export const createUserInfo = (nickname: string, bio: string): User => {
  checkNicknameOrThrowError(nickname)
  return {
    nickname: { value: nickname },
    bio: some(bio),
  }
}

export const createDefaultUser = (nickname: string): UserManager => {
  checkNicknameOrThrowError(nickname)
  const defaultLevel: Level = createDefaultLevel()
  return {
    userInfo: createDefaultUserInfo(nickname),
    profilePicture: none,
    languages: none,
    cv: none,
    trophies: none,
    level: defaultLevel,
  }
}

export const createAdvancedUser = (
  nickname: string,
  bio: string,
  profilePicture: ProfilePicture,
  languages: Iterable<Language>,
  cv: CV,
  trophies: Iterable<Trophy>,
  level: Level
): UserManager => {
  checkNicknameOrThrowError(nickname)
  checkUrlOrThrowError(profilePicture.url)
  checkUrlOrThrowError(cv.url)
  return {
    userInfo: createUserInfo(nickname, bio),
    profilePicture: some(profilePicture),
    languages: some(languages),
    cv: some(cv),
    trophies: some(trophies),
    level: level,
  }
}
