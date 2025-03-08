import { app } from '../../main/nodejs/codemaster/servicies/authentication/app'
import supertest from 'supertest'
import {
  BAD_REQUEST,
  CONFLICT,
  CREATED,
  INTERNAL_ERROR,
  OK,
} from '../../main/nodejs/codemaster/servicies/authentication/interfaces/status'

describe('Test API', () => {
  const timeout: number = 10000
  const request = supertest(app)
  const newUser = {
    nickname: 'example',
    email: 'example@example.com',
    password: 'Test1234!',
  }

  describe('Test Register', () => {
    it(
      'should return 201 and user register',
      async () => {
        const response = await request
          .post('/authentication/register')
          .send(newUser)
          .set('Accept', 'application/json')

        expect(response.status).toBe(CREATED)
        expect(response.body.message).toBe('User registered')
        expect(response.body.success).toBe(true)
        expect(response.body.user).toHaveProperty('id.value', newUser.nickname)
        expect(response.body.user).toHaveProperty('email', newUser.email)
      },
      timeout
    )

    it(
      'should return 400 and user not register because wrong password format',
      async () => {
        const badPasswordNewUser = {
          nickname: 'example',
          email: 'example@example.com',
          password: 'weak',
        }

        const response = await request
          .post('/authentication/register')
          .send(badPasswordNewUser)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe(
          'Invalid password format, at least 8 characters, one uppercase letter, one number and one special character'
        )
      },
      timeout
    )

    it(
      'should return 400 and user not register because wrong nickname format',
      async () => {
        const badNicknameNewUser = {
          nickname: 'example@%$^@(#%!^@(%^',
          email: 'example@example.com',
          password: 'Test1234!',
        }

        const response = await request
          .post('/authentication/register')
          .send(badNicknameNewUser)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe(
          'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
        )
      },
      timeout
    )

    it(
      'should return 400 and user not register because wrong email format',
      async () => {
        const badEmailNewUser = {
          nickname: 'example',
          email: 'example.com',
          password: 'Test1234!',
        }

        const response = await request
          .post('/authentication/register')
          .send(badEmailNewUser)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Invalid email format')
      },
      timeout
    )

    it(
      'should return 409 and user not register because user already exist',
      async () => {
        const newUser = {
          nickname: 'example',
          email: 'example@example.com',
          password: 'Test1234!',
        }

        const response = await request
          .post('/authentication/register')
          .send(newUser)
          .set('Accept', 'application/json')

        expect(response.status).toBe(CONFLICT)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('User already exist')
      },
      timeout
    )
  })

  describe('Test Login', () => {
    it(
      'should return 200 and user correct logged in by nickname',
      async () => {
        const existUserNickname = {
          nickname: newUser.nickname,
          password: newUser.password,
        }

        const response = await request
          .post('/authentication/login')
          .send(existUserNickname)
          .set('Accept', 'application/json')

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe('User LoggedIn')
        expect(response.body.success).toBe(true)
        expect(response.body.token).toBeDefined()
        expect(response.headers['set-cookie']).toBeDefined()
      },
      timeout
    )

    it(
      'should return 200 and user is already logged in',
      async () => {
        const normalUser = {
          nickname: newUser.nickname,
          password: newUser.password,
        }

        const response = await request
          .post('/authentication/login')
          .send(normalUser)
          .set('Accept', 'application/json')

        const authToken = response.headers['set-cookie'][0].split(';')[0].split('=')[1]
        const alreadyAuthenticatedResponse = await request
          .post('/authentication/login')
          .set('Accept', 'application/json')
          .set('Cookie', `auth_token=${authToken}`)

        expect(alreadyAuthenticatedResponse.status).toBe(OK)
        expect(alreadyAuthenticatedResponse.body.message).toBe(
          'User is already authenticated'
        )
        expect(alreadyAuthenticatedResponse.body.success).toBe(true)
      },
      timeout
    )

    it(
      'should return 200 and user correct logged in by email',
      async () => {
        const existUserEmail = {
          email: newUser.email,
          password: newUser.password,
        }

        const response = await request
          .post('/authentication/login')
          .send(existUserEmail)
          .set('Accept', 'application/json')

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe('User LoggedIn')
        expect(response.body.success).toBe(true)
        expect(response.body.token).toBeDefined()
        expect(response.headers['set-cookie']).toBeDefined()
      },
      timeout
    )

    it(
      'should return 400 because user have insert an incorrect password but correct nickname',
      async () => {
        const incorrectPassword = {
          nickname: newUser.nickname,
          password: 'incorrect',
        }

        const response = await request
          .post('/authentication/login')
          .send(incorrectPassword)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Invalid Credentials')
      },
      timeout
    )

    it(
      'should return 400 because user have insert an incorrect password but correct email',
      async () => {
        const incorrectPassword = {
          email: newUser.email,
          password: 'incorrect',
        }

        const response = await request
          .post('/authentication/login')
          .send(incorrectPassword)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Invalid Credentials')
      },
      timeout
    )

    it(
      'should return 400 because user not exist',
      async () => {
        const incorrectNickname = {
          nickname: 'notExistUser',
          password: 'incorrect',
        }

        const response = await request
          .post('/authentication/login')
          .send(incorrectNickname)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('User not found')
      },
      timeout
    )
  })

  describe('Test Logout', () => {
    it(
      'should return 200 for correct user logout',
      async () => {
        const correctUser = {
          nickname: newUser.nickname,
        }

        const response = await request
          .post('/authentication/logout')
          .send(correctUser)
          .set('Accept', 'application/json')

        expect(response.status).toBe(OK)
        expect(response.body.success).toBe(true)
        expect(response.body.message).toBe('User LoggedOut')
        expect(response.headers['set-cookie']).toBeDefined()
        expect(response.headers['set-cookie'][0]).toMatch(/auth_token=;/)
      },
      timeout
    )

    it(
      'should return 400 because user not exist',
      async () => {
        const incorrectUser = {
          nickname: 'imNotExist',
        }

        const response = await request
          .post('/authentication/logout')
          .send(incorrectUser)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('User not found')
      },
      timeout
    )
  })

  describe('Test RefreshToken', () => {
    beforeAll(async () => {
      const existUserNickname = {
        nickname: newUser.nickname,
        password: newUser.password,
      }

      await request
        .post('/authentication/login')
        .send(existUserNickname)
        .set('Accept', 'application/json')
    }, timeout)

    it(
      'should return 200 and correct refreshing token',
      async () => {
        const correctUser = {
          nickname: newUser.nickname,
        }

        const response = await request
          .post('/authentication/refresh-access-token')
          .send(correctUser)
          .set('Accept', 'application/json')

        expect(response.status).toBe(OK)
        expect(response.body.success).toBe(true)
        expect(response.body.message).toBe('User Access Token refreshed')
        expect(response.body.token).toBeDefined()
      },
      timeout
    )

    it(
      'should return 400 because user not exist',
      async () => {
        const incorrectUser = {
          nickname: 'imNotExist',
        }

        const response = await request
          .post('/authentication/refresh-access-token')
          .send(incorrectUser)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('User not found')
      },
      timeout
    )

    it(
      'should return 500 because user not logged in',
      async () => {
        const correctUser = {
          nickname: newUser.nickname,
        }

        await request
          .post('/authentication/logout')
          .send(correctUser)
          .set('Accept', 'application/json')

        const response = await request
          .post('/authentication/refresh-access-token')
          .send(correctUser)
          .set('Accept', 'application/json')

        expect(response.status).toBe(INTERNAL_ERROR)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Invalid RefreshToken')
      },
      timeout
    )
  })

  describe('Test update email', () => {
    it(
      'should finish successfully and update the email',
      async () => {
        const correctEmailParams = {
          nickname: newUser.nickname,
          newEmail: 'example1234@example.com',
        }

        const response = await request
          .put('/authentication/update-email')
          .send(correctEmailParams)
          .set('Accept', 'application/json')

        expect(response.status).toBe(OK)
        expect(response.body.success).toBe(true)
        expect(response.body.message).toBe('Email updated')
      },
      timeout
    )

    it(
      'should throw error since the email is in an incorrect format',
      async () => {
        const incorrectEmailParamsNotValidFormat = {
          nickname: newUser.nickname,
          newEmail: 'example.com',
        }

        const response = await request
          .put('/authentication/update-email')
          .send(incorrectEmailParamsNotValidFormat)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Invalid email format')
      },
      timeout
    )

    it(
      'should throw error since the user does not exist',
      async () => {
        const incorrectEmailUserNotExist = {
          nickname: 'imNotExist',
          newEmail: 'example@example.com',
        }

        const response = await request
          .put('/authentication/update-email')
          .send(incorrectEmailUserNotExist)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('User not found')
      },
      timeout
    )
  })

  describe('Test update password', () => {
    it(
      'should finish successfully and update the password',
      async () => {
        const correctPasswordParams = {
          nickname: newUser.nickname,
          oldPassword: newUser.password,
          newPassword: 'Test123456789!',
        }

        const response = await request
          .put('/authentication/update-password')
          .send(correctPasswordParams)
          .set('Accept', 'application/json')

        expect(response.status).toBe(OK)
        expect(response.body.success).toBe(true)
        expect(response.body.message).toBe('Password updated')
      },
      timeout
    )

    it(
      'should throw error since the password is in an incorrect format',
      async () => {
        const incorrectPasswordParamsNotValidFormat = {
          nickname: newUser.nickname,
          oldPassword: newUser.password,
          newPassword: 'example',
        }

        const response = await request
          .put('/authentication/update-password')
          .send(incorrectPasswordParamsNotValidFormat)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Invalid password format')
      },
      timeout
    )

    it(
      'should throw error for incorrect old password',
      async () => {
        const incorrectPasswordParamsOldPassword = {
          nickname: newUser.nickname,
          oldPassword: 'Test123456!',
          newPassword: 'Test123456!',
        }

        const response = await request
          .put('/authentication/update-password')
          .send(incorrectPasswordParamsOldPassword)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Old password does not match')
      },
      timeout
    )

    it(
      'should throw error since the user does not exist',
      async () => {
        const userNotExist = {
          nickname: 'imNotExist',
          oldPassword: newUser.password,
          newPassword: 'Test123456!',
        }

        const response = await request
          .put('/authentication/update-password')
          .send(userNotExist)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('User not found')
      },
      timeout
    )
  })

  describe('Test delete user', () => {
    it(
      'should end successfully and delete the user',
      async () => {
        const nickname: string = newUser.nickname

        const response = await request
          .delete('/authentication/' + nickname)
          .send(nickname)
          .set('Accept', 'application/json')

        expect(response.status).toBe(OK)
        expect(response.body.success).toBe(true)
        expect(response.body.message).toBe('User deleted')
      },
      timeout
    )

    it(
      'should throw an error since the user does not exist',
      async () => {
        const notExistNickname: string = 'imNotExist'

        const response = await request
          .delete('/authentication/' + notExistNickname)
          .send(notExistNickname)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('User not found')
      },
      timeout
    )
  })
})
