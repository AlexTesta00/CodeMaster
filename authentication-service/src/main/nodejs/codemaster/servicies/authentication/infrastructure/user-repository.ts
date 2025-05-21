import { Error } from 'mongoose'
import { User, UserId } from '../domain/user'
import { Either, isRight, left, right } from 'fp-ts/Either'
import { UserModel } from './user-model'
import { createUserManager, UserManager } from '../domain/user-manager'
import { toUserModel, toUserManager } from './conversion'

export const saveUser = async (user: User): Promise<Either<Error, UserManager>> => {
  const userDocument = new UserModel(toUserModel(user))

  try {
    await userDocument.save()
    const userManager = createUserManager(
      user.nickname.value,
      user.email,
      user.password,
      user.role.name,
      false
    )
    if (isRight(userManager)) {
      return right(userManager.right)
    } else {
      return left(userManager.left)
    }
  } catch (error) {
    return left(error instanceof Error ? error : new Error(String(error)))
  }
}

export const findUserByNickname = async (
  nickname: UserId
): Promise<Either<Error, UserManager>> => {
  try {
    const userDocument = await UserModel.findOne({ nickname: nickname.value }).orFail()
    return right(toUserManager(userDocument))
  } catch (error) {
    void error
    return left(new Error('User not found'))
  }
}

export const findUserByEmail = async (
  email: string
): Promise<Either<Error, UserManager>> => {
  try {
    const userDocument = await UserModel.findOne({ email }).orFail()
    return right(toUserManager(userDocument))
  } catch (error) {
    void error
    return left(new Error('User not found'))
  }
}

export const findAllUsers = async (): Promise<Either<Error, Iterable<UserManager>>> => {
  try {
    const userDocuments = await UserModel.find().exec()
    return right(userDocuments.map(toUserManager))
  } catch (error) {
    void error
    return left(new Error('Error fetching users'))
  }
}

export const updateUserEmail = async (
  nickname: UserId,
  newEmail: string
): Promise<Either<Error, UserManager>> => {
  try {
    const userDocument = await UserModel.findOneAndUpdate(
      { nickname: nickname.value },
      { email: newEmail },
      { new: true }
    ).orFail()
    return right(toUserManager(userDocument))
  } catch (error) {
    return left(error instanceof Error ? error : new Error(String(error)))
  }
}

export const updateUserPassword = async (
  nickname: UserId,
  newPassword: string
): Promise<Either<Error, UserManager>> => {
  try {
    const userDocument = await UserModel.findOneAndUpdate(
      { nickname: nickname.value },
      { password: newPassword },
      { new: true }
    ).orFail()
    return right(toUserManager(userDocument))
  } catch (error) {
    return left(error instanceof Error ? error : new Error(String(error)))
  }
}

export const updateUserRefreshToken = async (
  nickname: UserId,
  refreshToken: string
): Promise<Either<Error, string>> => {
  try {
    await UserModel.findOneAndUpdate(
      { nickname: nickname.value },
      { refreshToken: refreshToken },
      { new: true }
    ).orFail()
    return right(refreshToken)
  } catch (error) {
    return left(error instanceof Error ? error : new Error(String(error)))
  }
}

export const deleteUser = async (nickname: UserId): Promise<Either<Error, void>> => {
  try {
    await UserModel.findOneAndDelete({ nickname: nickname.value }).orFail()
    return right(undefined)
  } catch (error) {
    void error
    return left(new Error('User not found'))
  }
}

export const banUser = async (nickname: UserId): Promise<Either<Error, UserManager>> => {
  try {
    const userDocument = await UserModel.findOneAndUpdate(
      { nickname: nickname.value },
      { isBanned: true },
      { new: true }
    ).orFail()
    return right(toUserManager(userDocument))
  } catch (error) {
    void error
    return left(new Error('User not found'))
  }
}

export const unbanUser = async (
  nickname: UserId
): Promise<Either<Error, UserManager>> => {
  try {
    const userDocument = await UserModel.findOneAndUpdate(
      { nickname: nickname.value },
      { isBanned: false },
      { new: true }
    ).orFail()
    return right(toUserManager(userDocument))
  } catch (error) {
    void error
    return left(new Error('User not found'))
  }
}
