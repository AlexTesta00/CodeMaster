import { UserManager } from '../domain/user-manager'
import { User, UserId } from '../domain/user'
import { Either, left, right } from 'fp-ts/Either'
import { createDefaultUser } from '../domain/user-factory'
import { UserManagerModel } from './schema'
import { UnknownError, UserNotFound } from './repository-error'
import { toUserManager, toUserManagerModel } from './conversion'

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
