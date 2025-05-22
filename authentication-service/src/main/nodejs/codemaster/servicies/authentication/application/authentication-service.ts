import { createUser, Role, UserId, validateEmail, validatePassword } from '../domain/user'
import { Either, isLeft, isRight, left, right, tryCatch as tryOrFail } from 'fp-ts/Either'
import { UserManager } from '../domain/user-manager'
import bcrypt from 'bcrypt'
import { pipe } from 'fp-ts/function'
import { tryCatch, chain, map, fromTask, TaskEither } from 'fp-ts/TaskEither'
import {
  findUserByNickname,
  saveUser,
  updateUserRefreshToken,
  updateUserPassword as updatePassword,
  updateUserEmail as updateEmail,
  deleteUser as deleteUserFromRepo,
} from '../infrastructure/user-repository'
import jwt, { JwtPayload } from 'jsonwebtoken'

const saltRounds: number = 16
const accessSecret: string = process.env.ACCESS_SECRET || 'access'
const refreshSecret: string = process.env.REFRESH_SECRET || 'refresh'

//TODO: Add method for ban and unban user

const fromPromiseEither =
  <E, A>(f: () => Promise<Either<E, A>>): TaskEither<E, A> =>
  () =>
    f()

export const generateHashFromPassword = async (
  password: string
): Promise<Either<Error, string>> =>
  pipe(
    tryCatch(
      () => bcrypt.genSalt(saltRounds),
      (error) => new Error(`Error generating salt: ${error}`)
    ),
    chain((salt) =>
      tryCatch(
        () => bcrypt.hash(password, salt),
        (error) => new Error(`Error hashing password: ${error}`)
      )
    )
  )()

export const isSamePassword = async (
  hashedPassword: string,
  cleanPassword: string
): Promise<Either<Error, boolean>> =>
  pipe(
    tryCatch(
      () => bcrypt.compare(cleanPassword, hashedPassword),
      (error) => new Error(`Error comparing passwords: ${error}`)
    )
  )()

export const generateAccessToken = (nickname: string, email: string): string =>
  jwt.sign({ nickname: nickname, email: email }, accessSecret, {
    expiresIn: '1d',
  })

export const generateRefreshToken = (nickname: string, email: string): string =>
  jwt.sign({ nickname: nickname, email: email }, refreshSecret, {
    expiresIn: '1w',
  })

export const verifyAccessToken = (token: string): Either<Error, string | JwtPayload> =>
  tryOrFail(
    () => jwt.verify(token, accessSecret),
    (error) => new Error(`Invalid access token: ${error}`)
  )

export const verifyRefreshToken = (token: string): Either<Error, string | JwtPayload> =>
  tryOrFail(
    () => jwt.verify(token, refreshSecret),
    (error) => new Error(`Invalid refresh token: ${error}`)
  )

export const registerUser = async (
  nickname: UserId,
  email: string,
  password: string,
  role: Role
): Promise<Either<Error, UserManager>> => {
  const user = createUser(nickname.value, email, password, role.name)
  if (isLeft(user)) {
    return left(user.left)
  } else {
    const hashedPassword = await generateHashFromPassword(user.right.password)
    if (isLeft(hashedPassword)) {
      return left(hashedPassword.left)
    } else {
      const newUser = {
        ...user.right,
        password: hashedPassword.right,
      }
      return await saveUser(newUser)
    }
  }
}

export const loginUser = async (
  nickname: UserId,
  password: string
): Promise<Either<Error, string>> => {
  const user = await findUserByNickname(nickname)
  if (isLeft(user)) {
    return left(user.left)
  } else {
    const isSamePasswordResult = await isSamePassword(user.right.info.password, password)
    if (isRight(isSamePasswordResult) && isSamePasswordResult.right) {
      const accessToken = generateAccessToken(
        user.right.info.nickname.value,
        user.right.info.email
      )
      const refreshToken = generateRefreshToken(
        user.right.info.nickname.value,
        user.right.info.email
      )
      const update = await updateUserRefreshToken(user.right.info.nickname, refreshToken)
      if (isRight(update)) {
        return right(accessToken)
      } else {
        return left(update.left)
      }
    } else {
      return left(new Error('Invalid Credentials'))
    }
  }
}

export const logoutUser = async (nickname: UserId): Promise<Either<Error, void>> =>
  pipe(
    fromPromiseEither(() => findUserByNickname(nickname)),
    chain(() => fromTask(() => updateUserRefreshToken(nickname, ''))),
    map(() => undefined)
  )()

export const deleteUser = async (nickname: UserId): Promise<Either<Error, void>> =>
  pipe(
    fromPromiseEither(() => findUserByNickname(nickname)),
    chain((user) => fromPromiseEither(() => deleteUserFromRepo(user.info.nickname)))
  )()

export const updateUserEmail = async (
  nickname: UserId,
  newEmail: string
): Promise<Either<Error, string>> => {
  const newValidEmail = validateEmail(newEmail)
  if (isLeft(newValidEmail)) {
    return left(newValidEmail.left)
  } else {
    const user = await findUserByNickname(nickname)
    if (isLeft(user)) {
      return left(user.left)
    } else {
      const update = await updateEmail(user.right.info.nickname, newValidEmail.right)
      if (isRight(update)) {
        return right(newValidEmail.right)
      } else {
        return left(update.left)
      }
    }
  }
}

export const updateUserPassword = async (
  nickname: UserId,
  oldPassword: string,
  newPassword: string
): Promise<Either<Error, string>> => {
  const user = await findUserByNickname(nickname)
  if (isLeft(user)) {
    return left(user.left)
  } else {
    const isSamePasswordResult = await isSamePassword(
      user.right.info.password,
      oldPassword
    )
    if (
      isRight(isSamePasswordResult) &&
      isSamePasswordResult.right &&
      isRight(validatePassword(newPassword))
    ) {
      const hashedPassword = await generateHashFromPassword(newPassword)
      if (isLeft(hashedPassword)) {
        return left(hashedPassword.left)
      } else {
        const update = await updatePassword(
          user.right.info.nickname,
          hashedPassword.right
        )
        if (isRight(update)) {
          return right(newPassword)
        } else {
          return left(update.left)
        }
      }
    } else {
      return left(new Error('Invalid Credentials'))
    }
  }
}

export const refreshAccessUserToken = async (
  nickname: UserId
): Promise<Either<Error, string>> => {
  const user = await findUserByNickname(nickname)
  if (isLeft(user)) {
    return left(user.left)
  } else {
    const refreshToken = user.right.refreshToken
    const verifyResult = verifyRefreshToken(refreshToken)
    if (isLeft(verifyResult)) {
      return left(verifyResult.left)
    } else {
      const accessToken = generateAccessToken(
        user.right.info.nickname.value,
        user.right.info.email
      )
      return right(accessToken)
    }
  }
}
