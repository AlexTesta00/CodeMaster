import { Request, Response } from 'express'
import {
  BAD_REQUEST,
  CONFLICT,
  CREATED,
  INTERNAL_ERROR,
  OK,
  UNAUTHORIZED,
} from './status'
import {
  banUser as banUserFromService,
  deleteUser as deleteUserFromService,
  findAllUsers as getAllUsersFromService,
  loginUser as login,
  logoutUser as logout,
  refreshAccessUserToken,
  registerUser,
  unbanUser as unbanUserFromService,
  updateUserEmail,
  updateUserPassword,
} from '../application/authentication-service'
import { isRight } from 'fp-ts/Either'
import { publishUserDeleted, publishUserRegistered } from '../infrastructure/publisher'

export const registerNewUser = async (req: Request, res: Response): Promise<void> => {
  const { nickname, email, password, role } = req.body

  const register = await registerUser({ value: nickname }, email, password, {
    name: role,
  })

  if (isRight(register)) {
    const newUser = register.right
    await publishUserRegistered(newUser.info.nickname)
    res.status(CREATED).json({ message: 'User registered', success: true, user: newUser })
  } else {
    const error = register.left
    if (error.message.includes('duplicate')) {
      res.status(CONFLICT).json({ message: 'User already exist', success: false })
    } else {
      res.status(BAD_REQUEST).json({ message: error.message, success: false })
    }
  }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { nickname, password } = req.body

  const token = await login({ value: nickname }, password)

  if (isRight(token)) {
    res.cookie('auth_token', token.right, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, //Expire in one day
      sameSite: 'strict',
    })
    res
      .status(OK)
      .json({ message: 'User LoggedIn', success: true, token: token.right })
      .end()
  } else {
    const error = token.left
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
}

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const { nickname } = req.body

  const result = await logout({ value: nickname })
  if (isRight(result)) {
    res.clearCookie('auth_token')
    res.status(OK).json({ message: 'User LoggedOut', success: true }).end()
  } else {
    const error = result.left
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
}

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  const { nickname } = req.body

  const result = await refreshAccessUserToken({ value: nickname })
  if (isRight(result)) {
    res
      .status(OK)
      .json({
        message: 'User Access Token refreshed',
        success: true,
        token: result.right,
      })
      .end()
  } else {
    const error = result.left
    if (error.message.includes('Invalid refresh token')) {
      res.status(INTERNAL_ERROR).json({ message: 'Invalid RefreshToken', success: false })
    } else {
      res.status(BAD_REQUEST).json({ message: error.message, success: false })
    }
  }
}

export const updateEmail = async (req: Request, res: Response): Promise<void> => {
  const { nickname, newEmail } = req.body

  const result = await updateUserEmail({ value: nickname }, newEmail)
  if (isRight(result)) {
    res.status(OK).json({ message: 'Email updated', success: true }).end()
  } else {
    const error = result.left
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
}

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  const { nickname, oldPassword, newPassword } = req.body

  const result = await updateUserPassword({ value: nickname }, oldPassword, newPassword)
  if (isRight(result)) {
    res.status(OK).json({ message: 'Password updated', success: true }).end()
  } else {
    const error = result.left
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const nickname: string = req.params.id
  await publishUserDeleted({ value: nickname })
  const result = await deleteUserFromService({ value: nickname })
  if (isRight(result)) {
    res.status(OK).json({ message: 'User deleted', success: true }).end()
  } else {
    const error = result.left
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
}

export const banUser = async (req: Request, res: Response): Promise<void> => {
  const { nicknameFrom, nicknameTo } = req.body

  const result = await banUserFromService({ value: nicknameFrom }, { value: nicknameTo })
  if (isRight(result)) {
    res.status(OK).json({ message: 'User banned', success: true }).end()
  } else {
    const error = result.left
    if (result.left.message.includes('not found')) {
      res.status(BAD_REQUEST).json({ message: error.message, success: false })
    } else {
      res.status(UNAUTHORIZED).json({ message: error.message, success: false })
    }
  }
}

export const unbanUser = async (req: Request, res: Response): Promise<void> => {
  const { nicknameFrom, nicknameTo } = req.body

  const result = await unbanUserFromService(
    { value: nicknameFrom },
    { value: nicknameTo }
  )
  if (isRight(result)) {
    res.status(OK).json({ message: 'User unbanned', success: true }).end()
  } else {
    const error = result.left
    if (result.left.message.includes('not found')) {
      res.status(BAD_REQUEST).json({ message: error.message, success: false })
    } else {
      res.status(UNAUTHORIZED).json({ message: error.message, success: false })
    }
  }
}

export const findAllUsers = async (req: Request, res: Response): Promise<void> => {
  const result = await getAllUsersFromService()
  if (isRight(result)) {
    res.status(OK).json({ message: 'Users found', success: true, users: result.right })
  } else {
    const error = result.left
    res.status(INTERNAL_ERROR).json({ message: error.message, success: false })
  }
}
