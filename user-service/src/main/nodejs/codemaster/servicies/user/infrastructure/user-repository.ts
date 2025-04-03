import { UserManager } from '../domain/user-manager'
import { User, UserId } from '../domain/user'
import { chain, Either, left, right } from 'fp-ts/Either'
import { createDefaultUser } from '../domain/user-factory'
import { UserManagerModel } from './schema'
import { UnknownError, UserNotFound } from './repository-error'
import { toUserManager, toUserManagerModel } from './conversion'
import { pipe } from 'fp-ts/function'
import { tryCatch, fromEither, chainW } from 'fp-ts/TaskEither'

export const saveDefaultUser = async (
  userInfo: User
): Promise<Either<Error, UserManager>> =>
  pipe(
    userInfo.nickname.value,
    createDefaultUser,
    fromEither,
    chainW((userManager) =>
      tryCatch(
        async () => {
          const userDocument = toUserManagerModel(userManager)
          await userDocument.save()
          return userManager
        },
        (error) => (error instanceof Error ? error : new UnknownError())
      )
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
  pipe(
    await tryCatch(
      async () => {
        const userDocument = await UserManagerModel.findOne({
          'userInfo.nickname': nickname.value,
        }).exec()
        return userDocument
          ? right(userDocument)
          : left(new UserNotFound('User not found'))
      },
      (error) => (error instanceof Error ? error : new UnknownError('Unknown error'))
    )(),
    chain((either) => either),
    chain((userDoc) => toUserManager(userDoc))
  )

export const updateUserInfo = async (
  nickname: UserId,
  newUserInfo: UserManager
): Promise<Either<Error, UserManager>> =>
  pipe(
    await tryCatch(
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
          },
          { new: true }
        ).exec()
        return userDocument
          ? right(userDocument)
          : left(new UserNotFound('User not found'))
      },
      (error) => (error instanceof Error ? error : new UnknownError('Unknown error'))
    )(),
    chain((either) => either),
    chain((userDoc) => toUserManager(userDoc))
  )

export const deleteUser = async (nickname: UserId): Promise<Either<Error, void>> =>
  pipe(
    await tryCatch(
      async () => {
        const userDocument = await UserManagerModel.findOneAndDelete({
          'userInfo.nickname': nickname.value,
        }).exec()
        return userDocument ? right(undefined) : left(new UserNotFound('User not found'))
      },
      (error) => (error instanceof Error ? error : new UnknownError('Unknown error'))
    )(),
    chain((either) => either)
  )

//TODO: Miss getAllUsers
