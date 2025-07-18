jest.mock(
    '../../main/nodejs/codemaster/servicies/authentication/infrastructure/publisher',
    () => ({
      connectToRabbit: jest.fn().mockResolvedValue(undefined),
      publishUserRegistered: jest.fn(),
      publishUserDeleted: jest.fn(),
    })
)

import { app } from '../../main/nodejs/codemaster/servicies/authentication/app'
import supertest from 'supertest'
import {
  BAD_REQUEST,
  CONFLICT,
  CREATED,
  INTERNAL_ERROR,
  OK,
  UNAUTHORIZED,
} from '../../main/nodejs/codemaster/servicies/authentication/interfaces/status'
import { UserManager } from '../../main/nodejs/codemaster/servicies/authentication/domain/user-manager'
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {UserModel} from "../../main/nodejs/codemaster/servicies/authentication/infrastructure/user-model";

describe('Test API', () => {
  let mongoServer: MongoMemoryServer
  const request = supertest(app)
  const newUser = {
    nickname: 'example',
    email: 'example@example.com',
    password: 'Test1234!',
    role: 'user',
  }

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  })

  afterAll(async () => {
    await UserModel.deleteMany({})
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Test Register', () => {
    it('should return 201 and user register', async () => {
      const response = await request
        .post('/api/v1/authentication/register')
        .send(newUser)
        .set('Accept', 'application/json')
      const user = response.body.user
      expect(response.status).toBe(CREATED)
      expect(response.body.message).toBe('User registered')
      expect(response.body.success).toBe(true)
      expect(user.info.nickname.value).toEqual(newUser.nickname)
      expect(user.info.email).toBe(newUser.email)
      expect(user.info).toHaveProperty('password')
      expect(user.info.role).toEqual({ name: 'user' })
      expect(user).toHaveProperty('banned', false)
      expect(user).toHaveProperty('refreshToken', '')
    })

    it('should return 400 and user not register because wrong password format', async () => {
      const badPasswordNewUser = {
        nickname: 'example',
        email: 'example@example.com',
        password: 'weak',
        role: 'user',
      }

      const response = await request
        .post('/api/v1/authentication/register')
        .send(badPasswordNewUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe(
        'Invalid password format, at least 8 characters, one uppercase letter, one number and one special character'
      )
    })

    it('should return 400 and user not register because wrong nickname format', async () => {
      const badNicknameNewUser = {
        nickname: 'example@%$^@(#%!^@(%^',
        email: 'example@example.com',
        password: 'Test1234!',
        role: 'user',
      }

      const response = await request
        .post('/api/v1/authentication/register')
        .send(badNicknameNewUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe(
        'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
      )
    })

    it('should return 400 and user not register because wrong email format', async () => {
      const badEmailNewUser = {
        nickname: 'example',
        email: 'example.com',
        password: 'Test1234!',
        role: 'user',
      }

      const response = await request
        .post('/api/v1/authentication/register')
        .send(badEmailNewUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid email format')
    })

    it('should return 409 and user not register because user already exist', async () => {
      const newUser = {
        nickname: 'example',
        email: 'example@example.com',
        password: 'Test1234!',
        role: 'user',
      }

      const response = await request
        .post('/api/v1/authentication/register')
        .send(newUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(CONFLICT)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User already exist')
    })
  })

  describe('Test Login', () => {
    it('should return 200 and user correct logged in by nickname', async () => {
      const existUserNickname = {
        nickname: newUser.nickname,
        password: newUser.password,
      }

      const response = await request
        .post('/api/v1/authentication/login')
        .send(existUserNickname)
        .set('Accept', 'application/json')

      expect(response.status).toBe(OK)
      expect(response.body.message).toBe('User LoggedIn')
      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()
      expect(response.headers['set-cookie']).toBeDefined()
      expect(response.body.user.info.nickname.value).toBe(existUserNickname.nickname)
      expect(response.body.user.info.email).toBe(newUser.email)
      expect(response.body.user.info).toHaveProperty('password')
      expect(response.body.user.info.role).toEqual({ name: 'user' })
      expect(response.body.user).toHaveProperty('banned', false)
    })

    it('should return 200 and user is already logged in', async () => {
      const normalUser = {
        nickname: newUser.nickname,
        password: newUser.password,
      }

      const response = await request
        .post('/api/v1/authentication/login')
        .send(normalUser)
        .set('Accept', 'application/json')

      const authToken = response.headers['set-cookie'][0].split(';')[0].split('=')[1]
      const alreadyAuthenticatedResponse = await request
        .post('/api/v1/authentication/login')
        .set('Accept', 'application/json')
        .set('Cookie', `auth_token=${authToken}`)

      expect(alreadyAuthenticatedResponse.status).toBe(OK)
      expect(alreadyAuthenticatedResponse.body.message).toBe(
        'User is already authenticated'
      )
      expect(alreadyAuthenticatedResponse.body.success).toBe(true)
    })

    it('should return 400 because user have insert an incorrect password but correct nickname', async () => {
      const incorrectPassword = {
        nickname: newUser.nickname,
        password: 'incorrect',
      }

      const response = await request
        .post('/api/v1/authentication/login')
        .send(incorrectPassword)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid Credentials')
    })

    it('should return 400 because user not exist', async () => {
      const incorrectNickname = {
        nickname: 'notExistUser',
        password: 'incorrect',
      }

      const response = await request
        .post('/api/v1/authentication/login')
        .send(incorrectNickname)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User not found')
    })
  })

  describe('Test Logout', () => {
    it('should return 200 for correct user logout', async () => {
      const correctUser = {
        nickname: newUser.nickname,
      }

      const response = await request
        .post('/api/v1/authentication/logout')
        .send(correctUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(OK)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('User LoggedOut')
      expect(response.headers['set-cookie']).toBeDefined()
      expect(response.headers['set-cookie'][0]).toMatch(/auth_token=;/)
    })

    it('should return 400 because user not exist', async () => {
      const incorrectUser = {
        nickname: 'imNotExist',
      }

      const response = await request
        .post('/api/v1/authentication/logout')
        .send(incorrectUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User not found')
    })
  })

  describe('Test RefreshToken', () => {
    beforeAll(async () => {
      const existUserNickname = {
        nickname: newUser.nickname,
        password: newUser.password,
      }

      await request
        .post('/api/v1/authentication/login')
        .send(existUserNickname)
        .set('Accept', 'application/json')
    })

    it('should return 200 and correct refreshing token', async () => {
      const correctUser = {
        nickname: newUser.nickname,
      }

      const response = await request
        .post('/api/v1/authentication/refresh-access-token')
        .send(correctUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(OK)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('User Access Token refreshed')
      expect(response.body.token).toBeDefined()
    })

    it('should return 400 because user not exist', async () => {
      const incorrectUser = {
        nickname: 'imNotExist',
      }

      const response = await request
        .post('/api/v1/authentication/refresh-access-token')
        .send(incorrectUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User not found')
    })

    it('should return 500 because user not logged in', async () => {
      const correctUser = {
        nickname: newUser.nickname,
      }

      await request
        .post('/api/v1/authentication/logout')
        .send(correctUser)
        .set('Accept', 'application/json')

      const response = await request
        .post('/api/v1/authentication/refresh-access-token')
        .send(correctUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(INTERNAL_ERROR)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid RefreshToken')
    })
  })

  describe('Test update email', () => {
    it('should finish successfully and update the email', async () => {
      const correctEmailParams = {
        nickname: newUser.nickname,
        newEmail: 'example1234@example.com',
      }

      const response = await request
        .patch('/api/v1/authentication/update-email')
        .send(correctEmailParams)
        .set('Accept', 'application/json')

      expect(response.status).toBe(OK)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Email updated')
    })

    it('should throw error since the email is in an incorrect format', async () => {
      const incorrectEmailParamsNotValidFormat = {
        nickname: newUser.nickname,
        newEmail: 'example.com',
      }

      const response = await request
        .patch('/api/v1/authentication/update-email')
        .send(incorrectEmailParamsNotValidFormat)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid email format')
    })

    it('should throw error since the user does not exist', async () => {
      const incorrectEmailUserNotExist = {
        nickname: 'imNotExist',
        newEmail: 'example@example.com',
      }

      const response = await request
        .patch('/api/v1/authentication/update-email')
        .send(incorrectEmailUserNotExist)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User not found')
    })
  })

  describe('Test update password', () => {
    it('should finish successfully and update the password', async () => {
      const correctPasswordParams = {
        nickname: newUser.nickname,
        oldPassword: newUser.password,
        newPassword: 'Test123456789!',
      }

      const response = await request
        .patch('/api/v1/authentication/update-password')
        .send(correctPasswordParams)
        .set('Accept', 'application/json')

      expect(response.status).toBe(OK)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Password updated')
    })

    it('should throw error since the password is in an incorrect format', async () => {
      const incorrectPasswordParamsNotValidFormat = {
        nickname: newUser.nickname,
        oldPassword: newUser.password,
        newPassword: 'example',
      }

      const response = await request
        .patch('/api/v1/authentication/update-password')
        .send(incorrectPasswordParamsNotValidFormat)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid Credentials')
    })

    it('should throw error for incorrect old password', async () => {
      const incorrectPasswordParamsOldPassword = {
        nickname: newUser.nickname,
        oldPassword: 'Test123456!',
        newPassword: 'Test123456!',
      }

      const response = await request
        .patch('/api/v1/authentication/update-password')
        .send(incorrectPasswordParamsOldPassword)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid Credentials')
    })

    it('should throw error since the user does not exist', async () => {
      const userNotExist = {
        nickname: 'imNotExist',
        oldPassword: newUser.password,
        newPassword: 'Test123456!',
      }

      const response = await request
        .patch('/api/v1/authentication/update-password')
        .send(userNotExist)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User not found')
    })
  })

  describe('Test delete user', () => {
    it('should end successfully and delete the user', async () => {
      const nickname: string = newUser.nickname

      const response = await request
        .delete('/api/v1/authentication/' + nickname)
        .send(nickname)
        .set('Accept', 'application/json')

      expect(response.status).toBe(OK)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('User deleted')
    })

    it('should throw an error since the user does not exist', async () => {
      const notExistNickname: string = 'imNotExist'

      const response = await request
        .delete('/api/v1/authentication/' + notExistNickname)
        .send(notExistNickname)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User not found')
    })
  })

  describe('Test ban/unban', () => {
    beforeAll(async () => {
      const adminUser = {
        nickname: 'admin',
        email: 'admin@example.com',
        password: 'Test1234!',
        role: 'admin',
      }

      await request
        .post('/api/v1/authentication/register')
        .send(adminUser)
        .set('Accept', 'application/json')

      await request
        .post('/api/v1/authentication/register')
        .send(newUser)
        .set('Accept', 'application/json')
    })

    afterAll(async () => {
      const adminUser = {
        nickname: 'admin',
      }

      await request
        .delete('/api/v1/authentication/' + adminUser.nickname)
        .send(adminUser.nickname)
        .set('Accept', 'application/json')

      await request
        .delete('/api/v1/authentication/' + newUser.nickname)
        .send(newUser.nickname)
        .set('Accept', 'application/json')
    })

    it('should successfully ban the user', async () => {
      const banUser = {
        nicknameFrom: 'admin',
        nicknameTo: newUser.nickname,
      }

      const response = await request
        .patch('/api/v1/authentication/ban')
        .send(banUser)
        .set('Accept', 'application/json')
      expect(response.status).toBe(OK)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('User banned')
    })

    it('should return an error since the user does not exist and ban not produce effect', async () => {
      const banUser = {
        nicknameFrom: 'admin',
        nicknameTo: 'imNotExist',
      }

      const response = await request
        .patch('/api/v1/authentication/ban')
        .send(banUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User not found')
    })

    it('should return an error since the user is not an admin and ban not produce effect', async () => {
      const banUser = {
        nicknameFrom: newUser.nickname,
        nicknameTo: 'admin',
      }

      const response = await request
        .patch('/api/v1/authentication/ban')
        .send(banUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(UNAUTHORIZED)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User is not authorized')
    })

    it('should successfully unban the user', async () => {
      const unbanUser = {
        nicknameFrom: 'admin',
        nicknameTo: newUser.nickname,
      }

      const response = await request
        .patch('/api/v1/authentication/unban')
        .send(unbanUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(OK)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('User unbanned')
    })

    it('should return an error since the user does not exist and unban not produce effect', async () => {
      const unbanUser = {
        nicknameFrom: 'admin',
        nicknameTo: 'imNotExist',
      }

      const response = await request
        .patch('/api/v1/authentication/unban')
        .send(unbanUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User not found')
    })

    it('should return an error since the user is not an admin and unban not produce effect', async () => {
      const unbanUser = {
        nicknameFrom: newUser.nickname,
        nicknameTo: 'admin',
      }

      const response = await request
        .patch('/api/v1/authentication/unban')
        .send(unbanUser)
        .set('Accept', 'application/json')

      expect(response.status).toBe(UNAUTHORIZED)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User is not authorized')
    })

    describe('Test find all users', () => {
      it('should correctly return all users', async () => {
        const response = await request
          .get('/api/v1/authentication/')
          .set('Accept', 'application/json')

        const users: UserManager[] = Array.from(response.body.users)
        expect(response.status).toBe(OK)
        expect(response.body.success).toBe(true)
        expect(users.length).toBe(2)
        expect(users[0].info.nickname.value).toBe('admin')
        expect(users[1].info.nickname.value).toBe(newUser.nickname)
      })
    })
  })
})
