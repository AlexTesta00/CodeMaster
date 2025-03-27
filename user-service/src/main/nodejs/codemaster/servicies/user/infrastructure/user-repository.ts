import { UserManager } from '../domain/user-manager'
import { User, UserId } from '../domain/user'
import { createLevel } from '../domain/level-factory'
import { Either, left, right } from 'fp-ts/Either'
import { createAdvancedUser, createDefaultUser } from '../domain/user-factory'
import { none, getOrElse, map, flatMap, toNullable, fromNullable } from 'fp-ts/Option'
import { UserManagerModel } from './schema'
import { UnknownError, UserNotFound } from './repository-error'
import { Language } from '../domain/language'
import { pipe } from 'fp-ts/function'
import { createTrophy } from '../domain/trophy-factory'

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

export const saveDefaultUser = async (
  userInfo: User
): Promise<Either<Error, UserManager>> => {
  try {
    const userManager = createDefaultUser(userInfo.nickname.value)
    const userDocument = toUserManagerModel(userManager)
    await userDocument.save()
    return right(userManager)
  } catch (error) {
    void error
    return left(error instanceof Error ? error : new UnknownError())
  }
}

export const saveAdvancedUser = async (
  userManager: UserManager
): Promise<Either<Error, UserManager>> => {
  try {
    const userDocument = toUserManagerModel(userManager)
    await userDocument.save()
    return right(userManager)
  } catch (error) {
    return left(error instanceof Error ? error : new Error('Uknown error'))
  }
}

export const findUser = async (nickname: UserId): Promise<Either<Error, UserManager>> => {
  try {
    const userDocument = await UserManagerModel.findOne({
      'userInfo.nickname': nickname.value,
    }).exec()
    if (!userDocument) return left(new UserNotFound('User not found'))
    return right(toUserManager(userDocument))
  } catch (error) {
    return left(error instanceof Error ? error : new UnknownError('Uknown error'))
  }
}

export const updateUserInfo = async (
  nickname: UserId,
  newUserInfo: UserManager
): Promise<Either<Error, UserManager>> => {
  try {
    const userManagerModel = toUserManagerModel(newUserInfo)
    const userDocument = await UserManagerModel.findOneAndUpdate(
      { 'userInfo.nickname': nickname.value },
      {
        $set: {
          'userInfo.bio': userManagerModel.userInfo.bio,
          'profilePicture.url': userManagerModel.profilePicture.url,
          'profilePicture.alt': userManagerModel.profilePicture.alt,
          languages: userManagerModel.languages,
          cv: userManagerModel.cv,
          trophies: userManagerModel.trophies,
          level: {
            grade: newUserInfo.level.grade.value,
            title: newUserInfo.level.title,
            xp: newUserInfo.level.xpLevel,
          },
        },
      }
    ).exec()
    if (!userDocument) return left(new UserNotFound('User not found'))
    return right(toUserManager(userDocument))
  } catch (error) {
    return left(error instanceof Error ? error : new UnknownError('Uknown error'))
  }
}

export const deleteUser = async (nickname: UserId): Promise<Either<Error, void>> => {
  try {
    const userDocument = await UserManagerModel.findOneAndDelete({
      'userInfo.nickname': nickname.value,
    }).exec()
    if (!userDocument) return left(new UserNotFound('User not found'))
    return right(undefined)
  } catch (error) {
    return left(error instanceof Error ? error : new UnknownError('Uknown error'))
  }
}
