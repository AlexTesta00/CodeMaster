import { User, UserId } from './user'
import { UserManager } from './user-manager'
import { Level } from './level'
import { ProfilePicture } from './profile-picture'
import { Language } from './language'
import { CV } from './cv'
import { Trophy } from './trophy'
import { checkNicknameOrThrowError, checkUrlOrThrowError } from './validator'
import { createDefaultLevel } from './level-factory'

export const createDefaultUserInfo = (nickname: string): User => {
  checkNicknameOrThrowError(nickname)
  return new User(new UserId(nickname), null)
}

export const createUserInfo = (nickname: string, bio: string): User => {
  checkNicknameOrThrowError(nickname)
  return new User(new UserId(nickname), bio)
}

export const createDefaultUser = (nickname: string): UserManager => {
  checkNicknameOrThrowError(nickname)
  const defaultLevel: Level = createDefaultLevel()
  return new UserManager(
    new User(new UserId(nickname), null),
    null,
    null,
    null,
    null,
    defaultLevel
  )
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
  const userInfo: User = new User(new UserId(nickname), bio)
  return new UserManager(userInfo, profilePicture, languages, cv, trophies, level)
}
