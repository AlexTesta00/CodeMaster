import { createUserManager } from '../../main/nodejs/codemaster/servicies/authentication/domain/user-manager'
import { isLeft, isRight } from 'fp-ts/Either'

describe('Test UserManager Factory', () => {
  const userId = 'example123'
  const wrongUserId = 'example!@#$%^&*('
  const email = 'example@example.com'
  const wrongEmail = 'exampleexample.com'
  const password = 'Test1234!'
  const wrongPassword = 'test!@#$%^&*&&^%$%^&*('

  it('should correct create user manager with correct data', async () => {
    const result = createUserManager(userId, email, password, 'admin', false)
    if (isRight(result)) {
      expect(result.right.info.nickname.value).toBe(userId)
      expect(result.right.info.email).toBe(email)
      expect(result.right.info.password).toBe(password)
      expect(result.right.info.role.name).toBe('admin')
      expect(result.right.banned).toBe(false)
    } else {
      fail()
    }
  })

  it('should not create user manager with incorrect userId', async () => {
    const result = createUserManager(wrongUserId, email, password, 'admin', false)
    expect(isLeft(result)).toBeTruthy()
  })

  it('should not create user manager with incorrect email', async () => {
    const result = createUserManager(userId, wrongEmail, password, 'admin', false)
    expect(isLeft(result)).toBeTruthy()
  })

  it('should not create user manager with incorrect password', async () => {
    const result = createUserManager(userId, email, wrongPassword, 'admin', false)
    expect(isLeft(result)).toBeTruthy()
  })

  it('should not create user manager with incorrect data', async () => {
    const result = createUserManager(
      wrongUserId,
      wrongEmail,
      wrongPassword,
      'admin',
      false
    )
    expect(isLeft(result)).toBeTruthy()
  })
})
