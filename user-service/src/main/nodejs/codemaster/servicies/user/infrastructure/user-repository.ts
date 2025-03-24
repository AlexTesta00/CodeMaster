import { UserManager } from '../domain/user-manager'
import { User, UserId } from '../domain/user'
import { createLevel } from '../domain/level-factory'
import { Either, left, right } from 'fp-ts/Either'
import { createAdvancedUser, createDefaultUser } from '../domain/user-factory'
import { some, none, isSome } from 'fp-ts/Option'
import { UserManagerModel } from './schema'
import { UnknownError, UserNotFound } from './repository-error'
import { ProfilePicture } from '../domain/profile-picture'
import { Trophy } from '../domain/trophy'
import { Language } from '../domain/language'
import { CV } from '../domain/cv'

export const toUserManagerModel = (userManager: UserManager) => {
  const bio: string = isSome(userManager.userInfo.bio)
    ? userManager.userInfo.bio.value
    : ''
  const profilePicture: ProfilePicture = isSome(userManager.profilePicture)
    ? userManager.profilePicture.value
    : { url: '', alt: none }
  const languages: Iterable<Language> = isSome(userManager.languages)
    ? userManager.languages.value
    : []
  const cv: CV = isSome(userManager.cv) ? userManager.cv.value : { url: '' }
  const trophies: Iterable<Trophy> = isSome(userManager.trophies)
    ? userManager.trophies.value
    : []
  const mapTrophies = Array.from(trophies).map((trophy: Trophy) => ({
    title: trophy.title.value,
    description: trophy.description,
    url: trophy.url,
    xp: trophy.xp,
  }))
  return new UserManagerModel({
    userInfo: {
      nickname: userManager.userInfo.nickname.value,
      bio: bio,
    },
    profilePicture: {
      url: profilePicture.url,
      alt: isSome(profilePicture.alt) ? profilePicture.alt : null,
    },
    languages: languages,
    cv: cv,
    trophies: mapTrophies,
    level: {
      grade: userManager.level.grade.value,
      title: userManager.level.title,
      xp: userManager.level.xpLevel,
    },
  })
}

//TODO: Fix any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toUserManager = (userDocument: any): UserManager => {
  const alt = userDocument.profilePicture.alt
    ? some(userDocument.profilePicture.alt)
    : none
  const profilePicture = { url: userDocument.profilePicture.url, alt: alt }
  const languages = userDocument.languages.map((language: Language) => ({
    name: language.name,
  }))
  const trophies = userDocument.trophies.map((trophy: Trophy) => ({
    title: { value: trophy.title },
    description: trophy.description,
    url: trophy.url,
    xp: trophy.xp,
  }))
  const level = createLevel(
    userDocument.level.grade,
    userDocument.level.title,
    userDocument.level.xp
  )
  return createAdvancedUser(
    userDocument.userInfo.nickname,
    userDocument.userInfo.bio,
    profilePicture,
    languages,
    userDocument.cv,
    trophies,
    level
  )
}

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
    const userBio = isSome(newUserInfo.userInfo.bio) ? newUserInfo.userInfo.bio.value : ''
    const profilePicture = isSome(newUserInfo.profilePicture)
      ? newUserInfo.profilePicture.value
      : { url: '', alt: none }
    const languages = isSome(newUserInfo.languages) ? newUserInfo.languages.value : []
    const cv = isSome(newUserInfo.cv) ? newUserInfo.cv.value : { url: '' }
    const trophies = isSome(newUserInfo.trophies) ? newUserInfo.trophies.value : []
    const allTrophies = Array.from(trophies).map((trophy: Trophy) => ({
      title: trophy.title.value,
      description: trophy.description,
      url: trophy.url,
      xp: trophy.xp,
    }))
    const userDocument = await UserManagerModel.findOneAndUpdate(
      { 'userInfo.nickname': nickname.value },
      {
        $set: {
          'userInfo.bio': userBio,
          'profilePicture.url': profilePicture.url,
          'profilePicture.alt': isSome(profilePicture.alt)
            ? profilePicture.alt.value
            : null,
          languages: languages,
          cv: cv,
          trophies: allTrophies,
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
