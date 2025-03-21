import { User } from './user'
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
  return {
    nickname: { value: nickname },
    bio: null,
  }
}

export const createUserInfo = (nickname: string, bio: string): User => {
  checkNicknameOrThrowError(nickname)
  return {
    nickname: { value: nickname },
    bio: bio,
  }
}

export const createDefaultUser = (nickname: string): UserManager => {
  checkNicknameOrThrowError(nickname)
  const defaultLevel: Level = createDefaultLevel()
  return {
    userInfo: createDefaultUserInfo(nickname),
    profilePicture: null,
    languages: null,
    cv: null,
    trophies: null,
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
    profilePicture: profilePicture,
    languages: languages,
    cv: cv,
    trophies: trophies,
    level: level,
  }
}
