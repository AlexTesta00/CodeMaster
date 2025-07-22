import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Error } from 'mongoose'
import { UserModel } from '../../main/nodejs/codemaster/servicies/authentication/infrastructure/user-model'
import {
  banUser,
  deleteUser,
  generateAccessToken,
  generateHashFromPassword,
  generateRefreshToken,
  isSamePassword,
  loginUser,
  logoutUser,
  refreshAccessUserToken,
  registerUser,
  unbanUser,
  updateUserEmail,
  updateUserPassword,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../main/nodejs/codemaster/servicies/authentication/application/authentication-service'
import { Either, isLeft, isRight } from 'fp-ts/Either'
import { UserManager } from '../../main/nodejs/codemaster/servicies/authentication/domain/user-manager'
import jwt, { JwtPayload } from 'jsonwebtoken'

describe('Test authentication service', () => {
  let mongoServer: MongoMemoryServer
  const uniqueId = Math.random().toString(36).substring(2, 8)
  const nickname: string = `${uniqueId}`
  const email: string = `${uniqueId}@example.com`
  const password: string = 'Example123!'
  const wrongEmail: string = 'thisemailnotExist@gmail.com'
  const wrongNickname: string = 'example1234567890'
  const wrongEmailFormat: string = 'example.com'
  const wrongNicknameFormat: string = 'example123@$%#$@%'

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  afterEach(async () => {
    await UserModel.deleteMany({})
  })

  describe('Test bcrypt service', () => {
    const password: string = 'abcd1234!'
    let hashedPassword: Either<Error, string>

    beforeAll(async () => {
      hashedPassword = await generateHashFromPassword(password)
    })

    it('should return different hash for same password', async () => {
      const differentHashForSamePassword: Either<Error, string> =
        await generateHashFromPassword(password)
      if (isRight(differentHashForSamePassword) && isRight(hashedPassword)) {
        expect(differentHashForSamePassword.right).not.toBe(hashedPassword.right)
      } else {
        throw new Error('Error generating hash for password')
      }
    })

    it('should return true, because hashed password corresponds to clean password', async () => {
      if (isRight(hashedPassword)) {
        const result = await isSamePassword(hashedPassword.right, password)
        if (isRight(result)) {
          expect(result.right).toBeTruthy()
        } else {
          throw new Error('Error generating hash for password')
        }
      } else {
        throw new Error('Error generating hash for password')
      }
    })

    it('should return true, because hashed password not corresponds to clean password', async () => {
      const notSamePassword: string = 'abcd'
      const generateHashFromNotSamePassword: Either<Error, string> =
        await generateHashFromPassword(notSamePassword)
      if (isRight(generateHashFromNotSamePassword) && isRight(hashedPassword)) {
        const result = await isSamePassword(
          hashedPassword.right,
          generateHashFromNotSamePassword.right
        )
        if (isRight(result)) {
          expect(result.right).toBeFalsy()
        } else {
          throw new Error('Error generating hash for password')
        }
      } else {
        throw new Error('Error generating hash for password')
      }
    })
  })

  describe('Test JWT Service', () => {
    const nickname: string = 'example'
    const email: string = 'test@test.com'
    let accesstoken: string
    let refreshToken: string

    beforeAll(() => {
      accesstoken = generateAccessToken(nickname, email)
      refreshToken = generateRefreshToken(nickname, email)
    })

    describe('Test access token', () => {
      it('should generate a valid access token', () => {
        expect(accesstoken).toBeDefined()
        expect(typeof accesstoken).toBe('string')
        const decoded = jwt.verify(accesstoken, 'access') as JwtPayload
        expect(decoded.nickname).toBe(nickname)
        expect(decoded.email).toBe(email)
      })

      it('should verify a valid access token', () => {
        const decoded = verifyAccessToken(accesstoken)
        if (isRight(decoded)) {
          expect((decoded.right as JwtPayload).nickname).toBe(nickname)
          expect((decoded.right as JwtPayload).email).toBe(email)
        } else {
          throw new Error('Error verifying access token')
        }
      })

      it('should return error because access token is invalid', () => {
        const invalidToken = 'invalid.invalid'
        const result = verifyAccessToken(invalidToken)
        if (isLeft(result)) {
          expect(result.left.message).toBe(
            'Invalid access token: JsonWebTokenError: jwt malformed'
          )
        }
      })
    })

    describe('Test refresh token', () => {
      it('should generate a valid refresh token', () => {
        expect(refreshToken).toBeDefined()
        expect(typeof refreshToken).toBe('string')
        const decoded = jwt.verify(refreshToken, 'refresh') as JwtPayload
        expect(decoded.nickname).toBe(nickname)
        expect(decoded.email).toBe(email)
      })

      it('should verify a valid refresh token', () => {
        const decoded = verifyRefreshToken(refreshToken)
        if (isRight(decoded)) {
          expect((decoded.right as JwtPayload).nickname).toBe(nickname)
          expect((decoded.right as JwtPayload).email).toBe(email)
        } else {
          throw new Error('Error verifying refresh token')
        }
      })

      it('should reject if refresh token is invalid', () => {
        const invalidToken = 'invalid.invalid'
        const result = verifyRefreshToken(invalidToken)
        if (isLeft(result)) {
          expect(result.left.message).toBe(
            'Invalid refresh token: JsonWebTokenError: jwt malformed'
          )
        } else {
          throw new Error('Error verifying refresh token')
        }
      })
    })
  })

  describe('Test register user', () => {
    let newUser: Either<Error, UserManager>

    beforeEach(async () => {
      newUser = await registerUser({ value: nickname }, email, password, { name: 'user' })
    })

    it('should correctly register user and return correct user info', async () => {
      if (isRight(newUser)) {
        const foundUser = await UserModel.findOne({ nickname: nickname })
        const passwordCheck = await isSamePassword(foundUser!.password, password)
        expect(foundUser?.nickname).toBe(newUser.right.info.nickname.value)
        expect(foundUser?.email).toBe(newUser.right.info.email)
        expect(foundUser?.isAdmin).toBeFalsy()
        expect(foundUser?.isBanned).toBeFalsy()
        expect(foundUser?.refreshToken).toBe(newUser.right.refreshToken)
        if (isRight(passwordCheck)) {
          expect(passwordCheck.right).toBeTruthy()
        } else {
          throw new Error('Error generating hash for password')
        }
      } else {
        throw new Error('Error registering user')
      }
    })

    it('should throw error if user already exists', async () => {
      const result = await registerUser({ value: nickname }, email, password, {
        name: 'user',
      })
      expect(isLeft(result)).toBeTruthy()
    })

    it('should return error because nickname is not in a valid format', async () => {
      const result = await registerUser({ value: wrongNicknameFormat }, email, password, {
        name: 'user',
      })
      if (isLeft(result)) {
        expect(result.left.message).toBe(
          'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
        )
      } else {
        throw new Error('Error registering user')
      }
    })

    it('should return error because email is not in a valid format', async () => {
      const result = await registerUser({ value: nickname }, wrongEmailFormat, password, {
        name: 'user',
      })
      if (isLeft(result)) {
        expect(result.left.message).toBe('Invalid email format')
      } else {
        throw new Error('Error registering user')
      }
    })

    it('should return error because password is not in a valid format', async () => {
      const result = await registerUser({ value: nickname }, email, '12345678', {
        name: 'user',
      })
      if (isLeft(result)) {
        expect(result.left.message).toBe(
          'Invalid password format, at least 8 characters, one uppercase letter, one number and one special character'
        )
      } else {
        throw new Error('Error registering user')
      }
    })
  })

  describe('Test login', () => {
    let newUser: Either<Error, UserManager>

    beforeEach(async () => {
      newUser = await registerUser({ value: nickname }, email, password, { name: 'user' })
    })

    it('should correctly login user and return correct refresh token', async () => {
      if (isRight(newUser)) {
        const token = await loginUser({ value: nickname }, password)
        const foundUser = await UserModel.findOne({ nickname: nickname })
        if (isRight(token)) {
          expect(token).not.toBeNull()
          expect(token).not.toBe('')
          const verifyAccess = verifyAccessToken(token.right)
          if (isRight(verifyAccess)) {
            expect((verifyAccess.right as JwtPayload).nickname).toBe(nickname)
            expect((verifyAccess.right as JwtPayload).email).toBe(email)
            expect(foundUser?.refreshToken).not.toBe('')
            const verifyRefresh = verifyRefreshToken(foundUser!.refreshToken!)
            if (isRight(verifyRefresh)) {
              expect((verifyRefresh.right as JwtPayload).nickname).toBe(nickname)
              expect((verifyRefresh.right as JwtPayload).email).toBe(email)
            } else {
              throw new Error(verifyRefresh.left.message)
            }
          } else {
            throw new Error(verifyAccess.left.message)
          }
        } else {
          throw new Error(token.left.message)
        }
      } else {
        throw new Error(newUser.left.message)
      }
    })

    it('should return error because user not exist', async () => {
      const result = await loginUser({ value: wrongNickname }, password)
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      } else {
        throw new Error('Error logging in user')
      }
    })

    it('should return error because password is not correct', async () => {
      const result = await loginUser({ value: nickname }, 'wrongpassword')
      if (isLeft(result)) {
        expect(result.left.message).toBe('Invalid Credentials')
      } else {
        throw new Error('Error logging in user')
      }
    })

    it('should return error because nickname is not in a valid format', async () => {
      const result = await loginUser({ value: wrongNicknameFormat }, password)
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      } else {
        throw new Error('Error logging in user')
      }
    })

    it('should return error because email is not in a valid format', async () => {
      const result = await loginUser({ value: nickname }, wrongEmailFormat)
      if (isLeft(result)) {
        expect(result.left.message).toBe('Invalid Credentials')
      } else {
        throw new Error('Error logging in user')
      }
    })

    it('should return error because password is not in a valid format', async () => {
      const result = await loginUser({ value: nickname }, '12345678')
      if (isLeft(result)) {
        expect(result.left.message).toBe('Invalid Credentials')
      } else {
        throw new Error('Error logging in user')
      }
    })
  })

  describe('Test logout', () => {
    let newUser: Either<Error, UserManager>

    beforeEach(async () => {
      newUser = await registerUser({ value: nickname }, email, password, { name: 'user' })
      await loginUser({ value: nickname }, password)
    })

    it('should correctly logout user and remove refresh token', async () => {
      if (isRight(newUser)) {
        const foundUser = await UserModel.findOne({ nickname: nickname })
        expect(foundUser?.refreshToken).not.toBe('')
        await logoutUser({ value: nickname })
        const foundUserAfterLogout = await UserModel.findOne({ nickname: nickname })
        expect(foundUserAfterLogout?.refreshToken).toBe('')
      } else {
        throw new Error('Error register in user')
      }
    })

    it('should return error because user not exist', async () => {
      const result = await logoutUser({ value: wrongNickname })
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      } else {
        throw new Error('Error logout in user')
      }
    })
  })

  describe('Test refresh token', () => {
    let newUser: Either<Error, UserManager>

    beforeEach(async () => {
      newUser = await registerUser({ value: nickname }, email, password, { name: 'user' })
    })

    it('should return a new access token if the refresh token is valid', async () => {
      if (isRight(newUser)) {
        const token = await loginUser({ value: nickname }, password)
        if (isRight(token)) {
          const refreshToken = await refreshAccessUserToken(newUser.right.info.nickname)
          if (isRight(refreshToken)) {
            expect(refreshToken.right).not.toBeNull()
            expect(refreshToken.right).not.toBe('')
            const verifyAccess = verifyAccessToken(refreshToken.right)
            if (isRight(verifyAccess)) {
              expect((verifyAccess.right as JwtPayload).nickname).toBe(nickname)
              expect((verifyAccess.right as JwtPayload).email).toBe(email)
            } else {
              throw new Error('Error verifying access token')
            }
          }
        } else {
          throw new Error('Error logging in user')
        }
      } else {
        throw new Error('Error registering user')
      }
    })

    it('should return error because refresh token is not valid', async () => {
      const result = await refreshAccessUserToken({ value: nickname })
      if (isLeft(result)) {
        expect(result.left.message).toBe(
          'Invalid refresh token: JsonWebTokenError: jwt must be provided'
        )
      } else {
        throw new Error('Error refreshing token')
      }
    })

    it('should return error because user not exist', async () => {
      const result = await refreshAccessUserToken({ value: wrongNickname })
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      } else {
        throw new Error('Error refreshing token')
      }
    })
  })

  describe('Test delete user', () => {
    let newUser: Either<Error, UserManager>

    beforeEach(async () => {
      newUser = await registerUser({ value: nickname }, email, password, { name: 'user' })
    })

    it('should correctly delete user', async () => {
      if (isRight(newUser)) {
        const result = await deleteUser({ value: nickname })
        const foundUser = await UserModel.findOne({ nickname: nickname })
        expect(isRight(result)).toBeTruthy()
        expect(foundUser).toBeNull()
      } else {
        throw new Error('Error register user')
      }
    })

    it('should return error because user not exist', async () => {
      const result = await deleteUser({ value: wrongNickname })
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      } else {
        throw new Error('Error deleting user')
      }
    })
  })

  describe('Test update email', () => {
    let newUser: Either<Error, UserManager>

    beforeEach(async () => {
      newUser = await registerUser({ value: nickname }, email, password, { name: 'user' })
    })

    it('should correctly update user email', async () => {
      if (isRight(newUser)) {
        const newEmail = 'stoprosik@example.com'
        const result = await updateUserEmail({ value: nickname }, newEmail)
        const foundUser = await UserModel.findOne({ nickname: nickname })
        expect(isRight(result)).toBeTruthy()
        expect(foundUser?.email).toBe(newEmail)
      } else {
        throw new Error('Error register user')
      }
    })
    it('should return error because email is not in a valid format', async () => {
      const result = await updateUserEmail({ value: nickname }, wrongEmailFormat)
      if (isLeft(result)) {
        expect(result.left.message).toBe('Invalid email format')
      } else {
        throw new Error('Error updating user email')
      }
    })

    it('should return error because user not exist', async () => {
      const result = await updateUserEmail({ value: wrongNickname }, wrongEmail)
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      } else {
        throw new Error('Error updating user email')
      }
    })
  })

  describe('Test update password', () => {
    let newUser: Either<Error, UserManager>

    beforeEach(async () => {
      newUser = await registerUser({ value: nickname }, email, password, { name: 'user' })
    })

    it('should correctly update user password', async () => {
      if (isRight(newUser)) {
        const newPassword = 'Newpassword123!'
        const result = await updateUserPassword(
          { value: nickname },
          password,
          newPassword
        )
        const foundUser = await UserModel.findOne({ nickname: nickname })
        expect(isRight(result)).toBeTruthy()
        const passwordCheck = await isSamePassword(foundUser!.password, newPassword)
        if (isRight(passwordCheck)) {
          expect(passwordCheck.right).toBeTruthy()
        } else {
          throw new Error('Error generating hash for password')
        }
      } else {
        throw new Error('Error register user')
      }
    })

    it('should return error because password is not in a valid format', async () => {
      const result = await updateUserPassword({ value: nickname }, password, '!@#$%^&*()')
      if (isLeft(result)) {
        expect(result.left.message).toBe('Invalid Credentials')
      } else {
        throw new Error('Error updating user password')
      }
    })

    it('should return error because user not exist', async () => {
      const result = await updateUserPassword(
        { value: wrongNickname },
        password,
        password
      )
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      } else {
        throw new Error('Error updating user password')
      }
    })
  })

  describe('Test ban and unban user', () => {
    let newUser: Either<Error, UserManager>
    let admin: Either<Error, UserManager>

    beforeEach(async () => {
      newUser = await registerUser({ value: nickname }, email, password, { name: 'user' })
      admin = await registerUser({ value: 'admin' }, 'admin@example.com', password, {
        name: 'admin',
      })
    })

    it('should correctly ban user', async () => {
      if (isRight(admin) && isRight(newUser)) {
        const result = await banUser({ value: 'admin' }, { value: nickname })
        const foundUser = await UserModel.findOne({ nickname: nickname })
        expect(isRight(result)).toBeTruthy()
        expect(foundUser?.isBanned).toBeTruthy()
      } else {
        throw new Error('Error register user')
      }
    })

    it('should return error because user not exist and ban not produce effect', async () => {
      const result = await banUser({ value: 'admin' }, { value: wrongNickname })
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      } else {
        throw new Error('Error banning user')
      }
    })

    it('should return error because user is not admin and ban not produce effect', async () => {
      const result = await banUser({ value: nickname }, { value: nickname })
      if (isLeft(result)) {
        expect(result.left.message).toBe('User is not authorized')
      } else {
        throw new Error('Error banning user')
      }
    })

    it('should correctly unban user', async () => {
      if (isRight(admin) && isRight(newUser)) {
        await banUser({ value: 'admin' }, { value: nickname })
        const result = await unbanUser({ value: 'admin' }, { value: nickname })
        const foundUser = await UserModel.findOne({ nickname: nickname })
        expect(isRight(result)).toBeTruthy()
        expect(foundUser?.isBanned).toBeFalsy()
      } else {
        throw new Error('Error register user')
      }
    })

    it('should return error because user not exist and unban not produce effect', async () => {
      const result = await unbanUser({ value: 'admin' }, { value: wrongNickname })
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      } else {
        throw new Error('Error unbanning user')
      }
    })

    it('should return error because user is not admin and unban not produce effect', async () => {
      const result = await unbanUser({ value: nickname }, { value: nickname })
      if (isLeft(result)) {
        expect(result.left.message).toBe('User is not authorized')
      } else {
        throw new Error('Error unbanning user')
      }
    })
  })

  describe('Test find all users', () => {
    let newUser: Either<Error, UserManager>
    let admin: Either<Error, UserManager>

    beforeEach(async () => {
      newUser = await registerUser({ value: nickname }, email, password, { name: 'user' })
      admin = await registerUser({ value: 'admin' }, 'admin@example.com', password, {
        name: 'admin',
      })
    })

    it('should correctly find all users', async () => {
      if (isRight(admin) && isRight(newUser)) {
        const result = await UserModel.find()
        expect(result.length).toBe(2)
        expect(result[0].nickname).toBe(nickname)
        expect(result[1].nickname).toBe('admin')
      } else {
        throw new Error('Error register user')
      }
    })
  })
})
