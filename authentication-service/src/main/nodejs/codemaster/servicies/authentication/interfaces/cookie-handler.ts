import { NextFunction, Request, Response } from 'express'
import { OK } from './status'
import { verifyAccessToken } from '../application/authentication-service'
import { isRight } from 'fp-ts/Either'

export const userIsAlreadyAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authToken = req.cookies.auth_token

  if (!authToken) {
    return next()
  }

  const decode = verifyAccessToken(authToken)
  if(isRight(decode)){
    req.body.user = decode.right
    res.status(OK).json({ message: 'User is already authenticated', success: true })
  }else{
    const error = decode.left
    if (error.name === 'TokenExpiredError') {
      res.status(OK).json({ message: 'Token expired', success: false })
    }
    if (error.name === 'JsonWebTokenError') {
      res.status(OK).json({ message: 'Invalid token', success: false })
    }
  }
}
