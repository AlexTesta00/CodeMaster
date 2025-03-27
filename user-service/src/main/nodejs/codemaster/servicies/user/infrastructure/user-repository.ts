import { UserManager } from '../domain/user-manager'
import { User, UserId } from '../domain/user'
import { Either } from 'fp-ts/Either'
import { createDefaultUser } from '../domain/user-factory'
import { UserManagerModel } from './schema'
import { UnknownError, UserNotFound } from './repository-error'
import { toUserManager, toUserManagerModel } from './conversion'
import { pipe } from 'fp-ts/function'
import { tryCatch } from 'fp-ts/TaskEither'

export const saveDefaultUser = async (
  userInfo: User
): Promise<Either<Error, UserManager>> =>
  pipe(
    tryCatch(
      async () => {
        const userManager = createDefaultUser(userInfo.nickname.value)
        const userDocument = toUserManagerModel(userManager)
        await userDocument.save()
        return userManager
      },
      (error) => (error instanceof Error ? error : new UnknownError())
    )
  )()

export const saveAdvancedUser = async (
  userManager: UserManager
): Promise<Either<Error, UserManager>> =>
  pipe(
    tryCatch(
      async () => {
        const userDocument = toUserManagerModel(userManager)
        await userDocument.save()
        return userManager
      },
      (error) => (error instanceof Error ? error : new UnknownError())
    )
  )()

export const findUser = async (nickname: UserId): Promise<Either<Error, UserManager>> =>
  tryCatch(
    async () => {
      const userDocument = await UserManagerModel.findOne({
        'userInfo.nickname': nickname.value,
      }).exec()
      if (!userDocument) throw new UserNotFound('User not found')
      return toUserManager(userDocument)
    },
    (error) => (error instanceof Error ? error : new UnknownError('Unknown error'))
  )()

export const updateUserInfo = async (
  nickname: UserId,
  newUserInfo: UserManager
): Promise<Either<Error, UserManager>> =>
  tryCatch(
    async () => {
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
      if (!userDocument) throw new UserNotFound('User not found')
      return toUserManager(userDocument)
    },
    (error) => (error instanceof Error ? error : new UnknownError('Unknown error'))
  )()

export const deleteUser = async (nickname: UserId): Promise<Either<Error, void>> =>
  tryCatch(
    async () => {
      const userDocument = await UserManagerModel.findOneAndDelete({
        'userInfo.nickname': nickname.value,
      }).exec()
      if (!userDocument) throw new UserNotFound('User not found')
      return undefined
    },
    (error) => (error instanceof Error ? error : new UnknownError('Unknown error'))
  )()
