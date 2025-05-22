import { createUser } from '../../main/nodejs/codemaster/servicies/authentication/domain/user'
import { isRight } from 'fp-ts/Either'
import {
  toUserManager,
  toUserModel,
} from '../../main/nodejs/codemaster/servicies/authentication/infrastructure/conversion'

describe('Test conversion', () => {
  const nickname: string = 'example'
  const email: string = 'example@example.com'
  const password: string = 'Example1234!'
  const role: 'admin' | 'user' = 'user'

  it('should correct convert UserManager to UserDocument', () => {
    const user = createUser(nickname, email, password, role)
    if (isRight(user)) {
      const conversion = toUserModel(user.right)
      expect(conversion.nickname).toBe(nickname)
      expect(conversion.email).toBe(email)
      expect(conversion.password).toBe(password)
      expect(conversion.isAdmin).toBeFalsy()
      expect(conversion.isBanned).toBeFalsy()
    } else {
      throw new Error('Failed to create user')
    }
  })

  it('should correct convert UserDocument to UserManager', () => {
    const userDocument = {
      nickname: nickname,
      email: email,
      password: password,
      isAdmin: false,
      isBanned: false,
      refreshToken: '',
    }
    const conversion = toUserManager(userDocument)
    expect(conversion.info.nickname.value).toBe(nickname)
    expect(conversion.info.email).toBe(email)
    expect(conversion.info.password).toBe(password)
    expect(conversion.info.role.name).toBe('user')
    expect(conversion.banned).toBeFalsy()
    expect(conversion.refreshToken).toBe(userDocument.refreshToken)
  })
})
