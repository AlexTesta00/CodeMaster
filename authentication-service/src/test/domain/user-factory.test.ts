import {
  createUser,
  validateEmail,
  validateNickname,
  validatePassword,
} from '../../main/nodejs/codemaster/servicies/authentication/domain/user'
import { isLeft, isRight } from 'fp-ts/Either'

describe('Test UserFactory', () => {
  const userId = 'example123'
  const wrongUserId = 'example!@#$%^&*('
  const email = 'example@example.com'
  const wrongEmail = 'exampleexample.com'
  const password = 'Test1234!'
  const wrongPassword = 'test!@#$%^&*&&^%$%^&*('

  it('should correct validate a correct nickname', async () => {
    const result = validateNickname(userId)
    expect(isRight(result)).toBeTruthy()
  })

  it('should not validate a incorrect nickname', async () => {
    const result = validateNickname(wrongUserId)
    expect(isLeft(result)).toBeTruthy()
  })

  it('should correct validate a correct email', async () => {
    const result = validateEmail(email)
    expect(isRight(result)).toBeTruthy()
  })

  it('should not validate a incorrect email', async () => {
    const result = validateEmail(wrongEmail)
    expect(isLeft(result)).toBeTruthy()
  })

  it('should correct validate a correct password', async () => {
    const result = validatePassword(password)
    expect(isRight(result)).toBeTruthy()
  })

  it('should not validate a incorrect password', async () => {
    const result = validatePassword(wrongPassword)
    expect(isLeft(result)).toBeTruthy()
  })

  it('should correct create user with correct data', async () => {
    const result = createUser(userId, email, password, 'admin')
    if (isRight(result)) {
      expect(result.right.nickname.value).toBe(userId)
      expect(result.right.email).toBe(email)
      expect(result.right.password).toBe(password)
      expect(result.right.role.name).toBe('admin')
    } else {
      fail()
    }
  })

  it('should not create user with incorrect data', async () => {
    const result = createUser(wrongUserId, wrongEmail, wrongPassword, 'admin')
    expect(isLeft(result)).toBeTruthy()
  })
})
