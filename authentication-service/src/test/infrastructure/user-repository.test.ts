import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserRepository } from '../../main/nodejs/codemaster/servicies/authentication/infrastructure/user-repository'
import { UserRepositoryImpl } from '../../main/nodejs/codemaster/servicies/authentication/infrastructure/user-repository-impl'
import { UserModel } from '../../main/nodejs/codemaster/servicies/authentication/infrastructure/user-model'
import { UserFactory } from '../../main/nodejs/codemaster/servicies/authentication/domain/user-factory'
import { User } from '../../main/nodejs/codemaster/servicies/authentication/domain/user'
import { UserId } from '../../main/nodejs/codemaster/servicies/authentication/domain/user-id'

describe('TestUserRepository', () => {
  let mongoServer: MongoMemoryServer
  let repository: UserRepository
  const nickname: UserId = new UserId('example')
  const email: string = 'example@example.com'
  const password: string = 'Test1234!'
  const user: User = UserFactory.createUser(nickname, email, password)
  const emailNotInDatabase: string = 'exampleexample@example.com'
  const nicknameNotInDatabase: UserId = new UserId('nonexistent')
  const defaultRefreshToken: string = ''
  const randomRefreshTokenValue: string = 'foo'
  const timeout: number = 10000

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
    repository = new UserRepositoryImpl()
  }, timeout)

  beforeEach(async () => {
    await repository.save(user)
  }, timeout)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  }, timeout)

  afterEach(async () => {
    await UserModel.deleteMany({})
  }, timeout)

  describe('Test save operation', () => {
    it(
      'should save a user to the database',
      async () => {
        const foundUser = await UserModel.findOne({ nickname: nickname }).exec()
        expect(foundUser).not.toBeNull()
        expect(foundUser?.nickname).toBe(nickname.value)
        expect(foundUser?.email).toBe(email)
        expect(foundUser?.refreshToken).toBe(defaultRefreshToken)
      },
      timeout
    )

    it('should return error if user already exists', async () => {
      await expect(repository.save(user)).rejects.toThrow()
    })
  })

  describe('Test findUserByNickname operation', () => {
    it(
      'should find a user by nickname',
      async () => {
        const foundUser = await repository.findUserByNickname(nickname)
        expect(foundUser).not.toBeNull()
        expect(user.id).toBe(nickname)
        expect(user.email).toBe(email)
      },
      timeout
    )

    it(
      'should return null if user is not found',
      async () => {
        await expect(
          repository.findUserByNickname(nicknameNotInDatabase)
        ).rejects.toThrow()
      },
      timeout
    )
  })

  describe('Test findUserByEmail operation', () => {
    it(
      'should find a user by email',
      async () => {
        const foundUser = await repository.findUserByEmail(email)
        expect(foundUser).not.toBeNull()
        expect(user.id.value).toBe(nickname.value)
        expect(user.email).toBe(email)
      },
      timeout
    )

    it(
      'should return null if user is not found',
      async () => {
        await expect(repository.findUserByEmail(emailNotInDatabase)).rejects.toThrow()
      },
      timeout
    )
  })

  describe('Test update function', () => {
    it(
      'should update user email',
      async () => {
        const newEmail: string = 'example.example@example.com'
        await repository.updateUserEmail(nickname, newEmail)
        const foundUser = await UserModel.findOne({ nickname: nickname }).exec()
        expect(foundUser).not.toBeNull()
        expect(foundUser?.email).toBe(newEmail)
      },
      timeout
    )

    it(
      'should update user password',
      async () => {
        const newPassword: string = 'Test12345!'
        await repository.updateUserPassword(nickname, newPassword)
        const foundUser = await UserModel.findOne({ nickname: nickname }).exec()
        expect(foundUser).not.toBeNull()
      },
      timeout
    )

    it(
      'should return error if user want to update email, but user not in db',
      async () => {
        await expect(
          repository.updateUserEmail(nicknameNotInDatabase, email)
        ).rejects.toThrow()
      },
      timeout
    )

    it('should return error if user want to update password, but user not in db', async () => {
      await expect(
        repository.updateUserPassword(nicknameNotInDatabase, password)
      ).rejects.toThrow()
    })
  })

  describe('Test delete function', () => {
    it(
      'should delete a user',
      async () => {
        await repository.deleteUser(nickname)
        const foundUser = await UserModel.findOne({ nickname: nickname }).exec()
        expect(foundUser).toBeNull()
      },
      timeout
    )

    it(
      'should return error if user not in db',
      async () => {
        await expect(repository.deleteUser(nicknameNotInDatabase)).rejects.toThrow()
      },
      timeout
    )
  })

  describe('Test token management', () => {
    it(
      'should return an empty token if the user has been saved',
      async () => {
        const foundedToken: string = await repository.getUserRefreshToken(nickname)
        expect(foundedToken).toBe(defaultRefreshToken)
      },
      timeout
    )

    it(
      'should return an updated refresh token value',
      async () => {
        await repository.updateUserRefreshToken(nickname, randomRefreshTokenValue)
        const foundedToken: string = await repository.getUserRefreshToken(nickname)
        expect(foundedToken).toBe(randomRefreshTokenValue)
      },
      timeout
    )

    it('should fail get token if user not exist', async () => {
      await expect(
        repository.getUserRefreshToken(nicknameNotInDatabase)
      ).rejects.toThrow()
    })

    it('should fail update token if user not exist', async () => {
      await expect(
        repository.updateUserRefreshToken(nicknameNotInDatabase, randomRefreshTokenValue)
      ).rejects.toThrow()
    })
  })
})
