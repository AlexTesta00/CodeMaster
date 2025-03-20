import { User, UserId } from './user'
import { UserManager } from './user-manager'
import { Level } from './level'
import { ProfilePicture } from './profile-picture'
import { Language } from './language'
import { CV } from './cv'
import { Trophy } from './trophy'
import { checkNicknameOrThrowError } from './validator'
import { createDefaultLevel } from './level-factory'

export const createDefaultUserInfo = (nickname: UserId): User => {
  checkNicknameOrThrowError(nickname)
  return new User(nickname, null)
}

export const createUserInfo = (nickname: UserId, bio: string): User => {
  checkNicknameOrThrowError(nickname)
  return new User(nickname, bio)
}

export const createDefaultUser = (nickname: UserId): UserManager => {
  checkNicknameOrThrowError(nickname)
  const defaultLevel: Level = createDefaultLevel()
  return new UserManager(new User(nickname, null), null, null, null, null, defaultLevel)
}

export const createAdvancedUser = (
  nickname: UserId,
  bio: string,
  profilePicture: ProfilePicture,
  languages: Iterable<Language>,
  cv: CV,
  trophies: Iterable<Trophy>,
  level: Level
): UserManager => {
  checkNicknameOrThrowError(nickname)
  const userInfo: User = new User(nickname, bio)
  return new UserManager(userInfo, profilePicture, languages, cv, trophies, level)
}
