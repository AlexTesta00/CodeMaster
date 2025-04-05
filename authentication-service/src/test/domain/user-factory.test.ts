import {
  UserFactory,
  UserFactoryError,
} from '../../main/nodejs/codemaster/servicies/authentication/domain/user-factory'
import { UserId } from '../../main/nodejs/codemaster/servicies/authentication/domain/user-id'

describe('TestUserFactory', () => {
  const userId = new UserId('example')
  const wrongUserId = new UserId('example!@#$%^&*(')
  const email = 'example@example.com'
  const password = 'Test1234!'
  const wrongEmail = 'exampleexample.com'

  it('should create user with correct value', async () => {
    const user = UserFactory.createUser(new UserId(userId.value), email, password)
    expect(user.id.value).toBe(userId.value)
    expect(user.email).toBe(email)
    expect(user.password).toBe(password)
  }, 10000)

  it('should throw error when create user with invalid email', async () => {
    expect(() => {
      UserFactory.createUser(userId, wrongEmail, password)
    }).toThrow(UserFactoryError.InvalidEmail)
  }, 10000)

  it('should throw error when create user with invalid nickname', async () => {
    expect(() => {
      UserFactory.createUser(wrongUserId, email, password)
    }).toThrow(UserFactoryError.InvalidNickname)
  }, 10000)
})
