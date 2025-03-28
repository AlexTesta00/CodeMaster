import { UserManager } from '../domain/user-manager'
import { LevelModel, TrophyModel, UserManagerModel } from './schema'
import { pipe } from 'fp-ts/function'
import { flatMap, fromNullable, getOrElse, map, none, toNullable } from 'fp-ts/Option'
import { createTrophy } from '../domain/trophy-factory'
import { createLevel } from '../domain/level-factory'
import { createAdvancedUser } from '../domain/user-factory'
import { Language } from '../domain/language'
import { Trophy } from '../domain/trophy'
import { Level } from '../domain/level'

const DEFAULT_BIO_VALUE = ''
const DEFAULT_PROFILE_PICTURE_VALUE = { url: '', alt: none }
const DEFAULT_LANGUAGES_VALUE: Iterable<Language> = []
const DEFAULT_CV_VALUE = { url: '' }
const DEFAULT_TROPHIES_VALUE: Array<{
  title: string
  description: string
  url: string
  xp: number
}> = []

interface UserDocument {
  profilePicture: {
    url: string
    alt?: string
  }
  languages: Array<{ name: string }>
  trophies: Array<{
    title: string
    description: string
    url: string
    xp: number
  }>
  level: {
    grade: number
    title: string
    xp: number
  }
  userInfo: {
    nickname: string
    bio?: string
  }
  cv: { url: string }
}

export const toUserManagerModel = (userManager: UserManager) => {
  return new UserManagerModel({
    userInfo: {
      nickname: userManager.userInfo.nickname.value,
      bio: pipe(
        userManager.userInfo.bio,
        getOrElse(() => DEFAULT_BIO_VALUE)
      ),
    },
    profilePicture: {
      url: pipe(
        userManager.profilePicture,
        map((p) => p.url),
        getOrElse(() => DEFAULT_PROFILE_PICTURE_VALUE.url)
      ),
      alt: pipe(
        userManager.profilePicture,
        flatMap((p) => p.alt),
        toNullable
      ),
    },
    languages: pipe(
      userManager.languages,
      getOrElse(() => DEFAULT_LANGUAGES_VALUE)
    ),
    cv: pipe(
      userManager.cv,
      getOrElse(() => DEFAULT_CV_VALUE)
    ),
    trophies: pipe(
      userManager.trophies,
      map((iterable) =>
        Array.from(iterable).map((trophy) => ({
          title: trophy.title.value,
          description: trophy.description,
          url: trophy.url,
          xp: trophy.xp,
        }))
      ),
      getOrElse(() => DEFAULT_TROPHIES_VALUE)
    ),
    level: {
      grade: userManager.level.grade.value,
      title: userManager.level.title,
      xp: userManager.level.xpLevel,
    },
  })
}

export const toUserManager = (userDocument: UserDocument): UserManager =>
  pipe(
    {
      nickname: userDocument.userInfo.nickname,
      bio: pipe(
        fromNullable(userDocument.userInfo.bio),
        getOrElse(() => '')
      ),
      profilePicture: {
        url: userDocument.profilePicture.url,
        alt: fromNullable(userDocument.profilePicture.alt),
      },
      languages: userDocument.languages,
      cv: userDocument.cv,
      trophies: userDocument.trophies.map((trophy) =>
        createTrophy(trophy.title, trophy.description, trophy.url, trophy.xp)
      ),
      level: createLevel(
        userDocument.level.grade,
        userDocument.level.title,
        userDocument.level.xp
      ),
    },
    ({ nickname, bio, profilePicture, languages, cv, trophies, level }) =>
      createAdvancedUser(nickname, bio, profilePicture, languages, cv, trophies, level)
  )

export const toTrophyModel = (trophy: Trophy) => {
  return new TrophyModel({
    title: trophy.title.value,
    description: trophy.description,
    url: trophy.url,
    xp: trophy.xp,
  })
}

export const toLevelModel = (level: Level) => {
  return new LevelModel({
    grade: level.grade.value,
    title: level.title,
    xp: level.xpLevel,
  })
}
