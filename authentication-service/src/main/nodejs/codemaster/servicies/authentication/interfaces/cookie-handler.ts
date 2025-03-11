import { Request, Response, NextFunction } from 'express'
import { JWTService } from '../application/jwt-service'
import { JWTServiceImpl } from '../application/jwt-service-impl'
import { OK } from './status'

const jwtService: JWTService = new JWTServiceImpl()

export const userIsAlreadyAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authToken = req.cookies.auth_token
  if (!authToken) {
    return next()
  }

  try {
    const decode = jwtService.verifyAccessToken(authToken)
    if (!decode) {
      next()
    }
    req.body.user = decode
    res.status(OK).json({ message: 'User is already authenticated', success: true })
  } catch (error) {
    next(error)
  }
}
