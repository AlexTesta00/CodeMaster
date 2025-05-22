import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserModel } from '../../main/nodejs/codemaster/servicies/authentication/infrastructure/user-model'
import {
  createUser,
  User,
} from '../../main/nodejs/codemaster/servicies/authentication/domain/user'
import {
  banUser,
  deleteUser,
  findAllUsers,
  findUserByEmail,
  findUserByNickname,
  saveUser,
  unbanUser,
  updateUserEmail,
  updateUserPassword,
  updateUserRefreshToken,
} from '../../main/nodejs/codemaster/servicies/authentication/infrastructure/user-repository'
import { Either, isLeft, isRight } from 'fp-ts/Either'

describe('TestUserRepository', () => {
  let mongoServer: MongoMemoryServer
  const nickname: string = 'example'
  const email: string = 'example@example.com'
  const password: string = 'Test1234!'
  const role: 'admin' | 'user' = 'user'
  const user: Either<Error, User> = createUser(nickname, email, password, role)
  const emailNotInDatabase: string = 'exampleexample@example.com'
  const nicknameNotInDatabase: string = 'nonexistent'
  const defaultRefreshToken: string = ''
  const randomRefreshTokenValue: string = 'foo'

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  })

  beforeEach(async () => {
    if (isRight(user)) {
      await saveUser(user.right)
    } else {
      fail()
    }
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  afterEach(async () => {
    await UserModel.deleteMany({})
  })

  describe('Test save operation', () => {
    it('should return correctly the user manager after user was saved', async () => {
      const foundUser = await UserModel.findOne({ nickname: nickname }).exec()
      expect(foundUser).toBeDefined()
      expect(foundUser?.nickname).toBe(nickname)
      expect(foundUser?.email).toBe(email)
      expect(foundUser?.password).toBe(password)
      expect(foundUser?.isAdmin).toBeFalsy()
      expect(foundUser?.isBanned).toBeFalsy()
      expect(foundUser?.refreshToken).toBe(defaultRefreshToken)
    })

    it('should return an error when trying to save a user with an existing nickname', async () => {
      if (isRight(user)) {
        const result = await saveUser(user.right)
        expect(isLeft(result)).toBeTruthy()
      } else {
        throw new Error('Failed, user can be duplicate in db')
      }
    })
  })

  describe('Test find operation', () => {
    it('should return the correct user when searching by nickname and exist in db', async () => {
      const resultFromNickname = await findUserByNickname({ value: nickname })
      expect(isRight(resultFromNickname)).toBeTruthy()
      if (isRight(resultFromNickname)) {
        expect(resultFromNickname.right.info.nickname.value).toBe(nickname)
        expect(resultFromNickname.right.info.email).toBe(email)
        expect(resultFromNickname.right.info.password).toBe(password)
        expect(resultFromNickname.right.info.role.name).toBe(role)
        expect(resultFromNickname.right.banned).toBeFalsy()
      }
    })

    it('should return the correct user when searching by email and exist in db', async () => {
      const resultFromEmail = await findUserByEmail(email)
      expect(isRight(resultFromEmail)).toBeTruthy()
      if (isRight(resultFromEmail)) {
        expect(resultFromEmail.right.info.nickname.value).toBe(nickname)
        expect(resultFromEmail.right.info.email).toBe(email)
        expect(resultFromEmail.right.info.password).toBe(password)
        expect(resultFromEmail.right.info.role.name).toBe(role)
        expect(resultFromEmail.right.banned).toBeFalsy()
      }
    })

    it('should return an error when searching for a user that does not exist', async () => {
      const result = await findUserByNickname({ value: nicknameNotInDatabase })
      expect(isLeft(result)).toBeTruthy()
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      }
    })

    it('should return an error when searching for a user by email that does not exist', async () => {
      const result = await findUserByNickname({ value: emailNotInDatabase })
      expect(isLeft(result)).toBeTruthy()
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      }
    })

    it('should correctly find all users', async () => {
      const result = await findAllUsers()
      expect(isRight(result)).toBeTruthy()
      if (isRight(result)) {
        const foundUsers = await UserModel.find().exec()
        expect(foundUsers.length).toBe(1)
        expect(foundUsers[0].nickname).toBe(nickname)
        expect(foundUsers[0].email).toBe(email)
        expect(foundUsers[0].password).toBe(password)
        expect(foundUsers[0].isAdmin).toBeFalsy()
        expect(foundUsers[0].isBanned).toBeFalsy()
        expect(foundUsers[0].refreshToken).toBe(defaultRefreshToken)
      }
    })

    it('should return an empty array when there are no users', async () => {
      await UserModel.deleteMany({})
      const result = await findAllUsers()
      expect(isRight(result)).toBeTruthy()
      if (isRight(result)) {
        expect(Array.from(result.right).length).toBe(0)
      }
    })
  })

  describe('Test update operation', () => {
    it('should correct update the user email', async () => {
      const newEmail = 'stoprosik@example.com'
      const result = await updateUserEmail({ value: nickname }, newEmail)
      const foundUser = await UserModel.findOne({ nickname: nickname }).exec()
      if (isRight(result)) {
        expect(result.right.info.email).toBe(newEmail)
        expect(foundUser?.email).toBe(newEmail)
      } else {
        throw new Error(result.left.message)
      }
    })

    it('should correct update the user password', async () => {
      const newPassword = 'Test12345!'
      const result = await updateUserPassword({ value: nickname }, newPassword)
      const foundUser = await UserModel.findOne({ nickname: nickname }).exec()
      if (isRight(result)) {
        expect(result.right.info.password).toBe(newPassword)
        expect(foundUser?.password).toBe(newPassword)
      } else {
        throw new Error('Failed to update password')
      }
    })

    it('should correct update refresh token', async () => {
      const result = await updateUserRefreshToken(
        { value: nickname },
        randomRefreshTokenValue
      )
      const foundUser = await UserModel.findOne({ nickname: nickname }).exec()
      if (isRight(result)) {
        expect(result.right).toBe(randomRefreshTokenValue)
        expect(foundUser?.refreshToken).toBe(randomRefreshTokenValue)
      } else {
        throw new Error(result.left.message)
      }
    })

    it('should fail all update because user not exist', async () => {
      const resultEmail = await updateUserEmail({ value: nicknameNotInDatabase }, email)
      const resultPassword = await updateUserPassword(
        { value: nicknameNotInDatabase },
        password
      )
      const resultRefreshToken = await updateUserRefreshToken(
        { value: nicknameNotInDatabase },
        randomRefreshTokenValue
      )
      expect(isLeft(resultEmail)).toBeTruthy()
      expect(isLeft(resultPassword)).toBeTruthy()
      expect(isLeft(resultRefreshToken)).toBeTruthy()
    })

    it('should correctly ban user', async () => {
      const result = await banUser({ value: nickname })
      const foundUser = await UserModel.findOne({ nickname: nickname }).exec()
      expect(isRight(result)).toBeTruthy()
      if (isRight(result)) {
        expect(result.right.banned).toBeTruthy()
        expect(foundUser?.isBanned).toBeTruthy()
      } else {
        throw new Error(result.left.message)
      }
    })

    it('should correct unban user', async () => {
      const result = await unbanUser({ value: nickname })
      const foundUser = await UserModel.findOne({ nickname: nickname }).exec()
      expect(isRight(result)).toBeTruthy()
      if (isRight(result)) {
        expect(result.right.banned).toBeFalsy()
        expect(foundUser?.isBanned).toBeFalsy()
      } else {
        throw new Error(result.left.message)
      }
    })

    it('should fail to unban user that does not exist', async () => {
      const result = await unbanUser({ value: nicknameNotInDatabase })
      expect(isLeft(result)).toBeTruthy()
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      }
    })

    it('should fail to ban user that does not exist', async () => {
      const result = await banUser({ value: nicknameNotInDatabase })
      expect(isLeft(result)).toBeTruthy()
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      }
    })
  })

  describe('Test delete operation', () => {
    it('should correct delete existing user', async () => {
      const result = await deleteUser({ value: nickname })
      const foundUser = await UserModel.findOne({ nickname: nickname }).exec()
      expect(isRight(result)).toBeTruthy()
      expect(foundUser).toBeNull()
    })

    it('should fail to delete user that does not exist', async () => {
      const result = await deleteUser({ value: nicknameNotInDatabase })
      expect(isLeft(result)).toBeTruthy()
      if (isLeft(result)) {
        expect(result.left.message).toBe('User not found')
      }
    })
  })
})
