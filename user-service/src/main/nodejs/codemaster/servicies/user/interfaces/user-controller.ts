import { Request, Response } from 'express'
import {
  changeUserBio,
  changeUserCV,
  changeUserLanguages,
  changeUserProfilePicture,
  changeUserTrophy,
  computeUserLevel,
  deleteUser,
  getAllUserInfo,
  registerNewUser,
  getAllUsers as getAllUsersFromService
} from '../application/user-service'
import { Either, isLeft } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { BAD_REQUEST, INTERNAL_ERROR, NOT_FOUND, OK } from './error-code'
import { isDatabaseConnected } from '../infrastructure/db-connection'
import { isRabbitConnected } from '../infrastructure/consumer'

export const handleResult = <L extends Error, R>(
  res: Response,
  result: Either<L, R>,
  successStatus: number,
  errorStatus: number,
  successMessage: string
): void => {
  if (isLeft(result))
    res.status(errorStatus).json({ message: result.left.message, success: false })
  else
    res
      .status(successStatus)
      .json({ message: successMessage, success: true, user: result.right })
}

export const registerUser = async (req: Request, res: Response): Promise<void> =>
  pipe(await registerNewUser({ value: req.body.nickname }), (result) =>
    handleResult(res, result, OK, BAD_REQUEST, 'User registered')
  )

export const getUser = async (req: Request, res: Response): Promise<void> =>
  pipe(await getAllUserInfo({ value: req.params.nickname }), (result) =>
    handleResult(res, result, OK, NOT_FOUND, 'User retrieved')
  )

export const updateUserBio = async (req: Request, res: Response): Promise<void> =>
  pipe(await changeUserBio({ value: req.body.nickname }, req.body.newBio), (result) =>
    handleResult(res, result, OK, NOT_FOUND, 'User bio changed')
  )

export const updateUserProfilePicture = async (
  req: Request,
  res: Response
): Promise<void> =>
  pipe(
    await changeUserProfilePicture(
      { value: req.body.nickname },
      req.body.newProfilePicture
    ),
    (result) => handleResult(res, result, OK, NOT_FOUND, 'User profile picture changed')
  )

export const updateUserCV = async (req: Request, res: Response): Promise<void> =>
  pipe(await changeUserCV({ value: req.body.nickname }, req.body.newCV), (result) =>
    handleResult(res, result, OK, NOT_FOUND, 'User CV changed')
  )

export const updateUserLanguages = async (req: Request, res: Response): Promise<void> =>
  pipe(
    await changeUserLanguages({ value: req.body.nickname }, req.body.newLanguages),
    (result) => handleResult(res, result, OK, NOT_FOUND, 'User languages changed')
  )

export const updateUserTrophies = async (req: Request, res: Response): Promise<void> =>
  pipe(
    await changeUserTrophy({ value: req.body.nickname }, req.body.newTrophies),
    (result) => handleResult(res, result, OK, NOT_FOUND, 'User trophies changed')
  )

export const removeUser = async (req: Request, res: Response): Promise<void> =>
  pipe(await deleteUser({ value: req.params.nickname }), (result) =>
    handleResult(res, result, OK, NOT_FOUND, 'User deleted')
  )

export const computeLevel = async (req: Request, res: Response): Promise<void> =>
  pipe(await computeUserLevel({ value: req.params.nickname }), (result) =>
    handleResult(res, result, OK, NOT_FOUND, 'User level computed')
  )

export const getAllUsers = async (req: Request, res: Response): Promise<void> =>
  pipe(await getAllUsersFromService(), (result) =>
    handleResult(res, result, OK, NOT_FOUND, 'All users retrieved')
  )

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const mongoReady = isDatabaseConnected()
  const rabbitReady = isRabbitConnected()
  if (mongoReady && rabbitReady) {
    res.status(OK).json({ status: 'OK', success: true })
  } else {
    res.status(INTERNAL_ERROR).json({
      status: 'Service Unavailable',
      success: false,
      mongo: mongoReady,
      rabbitReady: rabbitReady,
    })
  }
}
