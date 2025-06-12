import { UserManager } from '../domain/user-manager'
import { LevelModel, TrophyModel, UserManagerModel } from './schema'
import { pipe } from 'fp-ts/function'
import {
  flatMap,
  fromNullable,
  getOrElse,
  map,
  none,
  some,
  toNullable,
} from 'fp-ts/Option'
import { createAdvancedUserOption } from '../domain/user-factory'
import { Language } from '../domain/language'
import { Trophy } from '../domain/trophy'
import { Level } from '../domain/level'
import { Either } from 'fp-ts/Either'
import { createTrophy } from '../domain/trophy-factory'
import { createLevel } from '../domain/level-factory'

export const DEFAULT_BIO_VALUE = ''
export const DEFAULT_PROFILE_PICTURE_VALUE = { url: '', alt: none }
export const DEFAULT_LANGUAGES_VALUE: Iterable<Language> = []
export const DEFAULT_CV_VALUE = { url: '' }
export const DEFAULT_TROPHIES_VALUE: Iterable<{
  title: string
  description: string
  url: string
  xp: number
}> = []

export interface UserDocument {
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
    url: string
  }
  userInfo: {
    nickname: string
    bio?: string
  }
  cv: { url: string }
}

export interface TrophyDocument {
  title: string
  description: string
  url: string
  xp: number
}

export interface LevelDocument {
  grade: number
  title: string
  xp: number
  url: string
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
      url: userManager.level.imageUrl,
    },
  })
}

export const toUserManager = (userDocument: UserDocument): Either<Error, UserManager> =>
  createAdvancedUserOption(
    userDocument.userInfo.nickname,
    userDocument.userInfo.bio != '' && userDocument.userInfo.bio
      ? some(userDocument.userInfo.bio)
      : none,
    userDocument.profilePicture.url != ''
      ? some({
          url: userDocument.profilePicture.url,
          alt: fromNullable(userDocument.profilePicture.alt),
        })
      : none,
    Array.from(userDocument.languages).length !== 0
      ? some(
          userDocument.languages.map((language) => ({
            name: language.name,
          }))
        )
      : none,
    userDocument.cv.url != '' ? some({ url: userDocument.cv.url }) : none,
    Array.from(userDocument.trophies).length !== 0
      ? some(
          userDocument.trophies.map((trophy) => ({
            title: { value: trophy.title },
            description: trophy.description,
            url: trophy.url,
            xp: trophy.xp,
          }))
        )
      : none,
    {
      grade: { value: userDocument.level.grade },
      title: userDocument.level.title,
      xpLevel: userDocument.level.xp,
      imageUrl: userDocument.level.url,
    }
  )

export const toTrophyModel = (trophy: Trophy) => {
  return new TrophyModel({
    title: trophy.title.value,
    description: trophy.description,
    url: trophy.url,
    xp: trophy.xp,
  })
}

export const toTrophy = (trophyDocument: TrophyDocument): Either<Error, Trophy> =>
  createTrophy(
    trophyDocument.title,
    trophyDocument.description,
    trophyDocument.url,
    trophyDocument.xp
  )

export const toLevelModel = (level: Level) => {
  return new LevelModel({
    grade: level.grade.value,
    title: level.title,
    xp: level.xpLevel,
    url: level.imageUrl,
  })
}

export const toLevel = (levelDocument: LevelDocument): Either<Error, Level> =>
  createLevel(
    levelDocument.grade,
    levelDocument.title,
    levelDocument.xp,
    levelDocument.url
  )
