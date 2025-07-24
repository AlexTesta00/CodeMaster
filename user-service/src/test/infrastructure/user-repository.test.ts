import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { UserManagerModel } from '../../main/nodejs/codemaster/servicies/user/infrastructure/schema'
import { UserManager } from '../../main/nodejs/codemaster/servicies/user/domain/user-manager'
import {
  createAdvancedUser,
  createUserInfo,
} from '../../main/nodejs/codemaster/servicies/user/domain/user-factory'
import { createTrophy } from '../../main/nodejs/codemaster/servicies/user/domain/trophy-factory'
import { createDefaultLevel } from '../../main/nodejs/codemaster/servicies/user/domain/level-factory'
import { isSome, none } from 'fp-ts/Option'
import {
  deleteUser,
  findUser,
  getAllUsersFromRepo,
  saveAdvancedUser,
  saveDefaultUser,
  updateUserInfo,
} from '../../main/nodejs/codemaster/servicies/user/infrastructure/user-repository'
import { Either, isLeft, isRight } from 'fp-ts/Either'
let mongoMemoryServer: MongoMemoryServer
const timeout: number = 10000
const nickname: string = 'example'
const bio: string = 'Test bio'
const profilePicture = { url: 'https://example.com', alt: none }
const languages = [{ name: 'Kotlin' }, { name: 'Scala' }, { name: 'Python' }]
const cv = { url: 'https://example.com' }
const trophy = createTrophy('First', 'First trophy', 'https://example.com', 1)
const rightTrophy = isRight(trophy) ? trophy.right : null
const trophies = [rightTrophy!]
const level = createDefaultLevel()
const rightLevel = isRight(level) ? level.right : null
const newUserInfo = createUserInfo(nickname, bio)
const userInfo = isRight(newUserInfo) ? newUserInfo.right : null
const newUser: Either<Error, UserManager> = createAdvancedUser(
  nickname,
  bio,
  profilePicture,
  languages,
  cv,
  trophies,
  rightLevel!
)
const newUserManager = isRight(newUser) ? newUser.right : null

describe('Test user repository', () => {
  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    const uri = mongoMemoryServer.getUri()
    await mongoose.connect(uri)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoMemoryServer.stop()
  })

  beforeEach(async () => {
    await UserManagerModel.deleteMany({})
  })

  describe('Test save user', () => {
    it(
      'should save a default user',
      async () => {
        await saveDefaultUser(userInfo!)
        const user = await UserManagerModel.findOne({ 'userInfo.nickname': nickname })
        expect(user).not.toBeNull()
        expect(user?.userInfo.nickname).toEqual(nickname)
        expect(user?.userInfo.bio).toEqual('')
        expect(user?.profilePicture.alt).toBeNull()
        expect(user?.profilePicture.url).toBe('')
        expect(user?.languages.length).toBe(0)
        expect(user?.cv.url).toBe('')
        expect(user?.trophies.length).toBe(0)
        expect(user?.level.grade).toEqual(rightLevel!.grade.value)
        expect(user?.level.title).toEqual(rightLevel!.title)
        expect(user?.level.xp).toEqual(rightLevel!.xpLevel)
        expect(user?.level.url).toBe(rightLevel!.imageUrl)
      },
      timeout
    )

    it(
      'should save an advanced user',
      async () => {
        await saveAdvancedUser(newUserManager!)
        const user = await UserManagerModel.findOne({ 'userInfo.nickname': nickname })
        expect(user).not.toBeNull()
        expect(user?.userInfo.nickname).toEqual(nickname)
        expect(user?.userInfo.bio).toEqual(bio)
        expect(user?.profilePicture.alt).toBeNull()
        expect(user?.profilePicture.url).toBe('https://example.com')
        expect(user?.languages.length).toBe(3)
        expect(user?.cv.url).toBe('https://example.com')
        expect(user?.trophies.length).toBe(1)
        expect(user?.level.grade).toEqual(rightLevel!.grade.value)
        expect(user?.level.title).toEqual(rightLevel!.title)
        expect(user?.level.xp).toEqual(rightLevel!.xpLevel)
        expect(user?.level.url).toEqual(rightLevel!.imageUrl)
      },
      timeout
    )

    it(
      'should reject saving a user with the same nickname',
      async () => {
        await saveDefaultUser(userInfo!)
        const result2 = await saveDefaultUser(userInfo!)
        expect(isLeft(result2)).toBeTruthy()
      },
      timeout
    )
  })

  describe('Test find user', () => {
    it(
      'should return correct user info',
      async () => {
        await saveAdvancedUser(newUserManager!)
        const result = await findUser(userInfo!.nickname)
        const resultUserNickname = isRight(result)
          ? result.right.userInfo.nickname.value
          : ''
        const resultUserBio = isRight(result) ? result.right.userInfo.bio : none
        const bioValue = isSome(resultUserBio) ? resultUserBio.value : ''
        const resultUserLanguages = isRight(result) ? result.right.languages : none
        const resultUserCV = isRight(result) ? result.right.cv : none
        const resultUserTrophies = isRight(result) ? result.right.trophies : none
        const resultUserLevel = isRight(result) ? result.right.level : none
        expect(isRight(result)).toBeTruthy()
        expect(resultUserNickname).toEqual(nickname)
        expect(bioValue).toEqual(bio)
        expect(isSome(resultUserLanguages)).toBeTruthy()
        expect(isSome(resultUserCV)).toBeTruthy()
        expect(isSome(resultUserTrophies)).toBeTruthy()
        expect(resultUserLevel).toEqual(rightLevel)
      },
      timeout
    )

    it(
      'should return error because user not exist',
      async () => {
        const result = await findUser(userInfo!.nickname)
        const error = isLeft(result) ? result.left : new Error('Unknown error')
        expect(isLeft(result)).toBeTruthy()
        expect(error.message).toBe('User not found')
      },
      timeout
    )

    it('should correctly return all users', async () => {
      await saveAdvancedUser(newUserManager!)
      const result = await getAllUsersFromRepo()
      expect(isRight(result)).toBeTruthy()
      if (isRight(result)) {
        const array = Array.from(result.right)
        expect(array.length).toBe(1)
        expect(array[0].userInfo.nickname.value).toEqual(nickname)
        expect(isSome(array[0].userInfo.bio)).toBeTruthy()
      }
    })
  })

  describe('Test update user info', () => {
    it(
      'should update user info',
      async () => {
        await saveAdvancedUser(newUserManager!)
        const newBio = 'New bio'
        const newLanguages = [...languages, { name: 'Java' }]
        const newCV = { url: 'https://exampleexample.com' }
        const newTrophy = createTrophy(
          'Second',
          'Second trophy',
          'https://example2.com',
          2
        )
        const rightNewTrophy = isRight(newTrophy) ? newTrophy.right : null
        const newTrophies = [...trophies, rightNewTrophy!]
        const updatedInfo = createAdvancedUser(
          nickname,
          newBio,
          profilePicture,
          newLanguages,
          newCV,
          newTrophies,
          rightLevel!
        )
        const info = isRight(updatedInfo) ? updatedInfo.right : null
        await updateUserInfo(userInfo!.nickname, info!)
        const user = await UserManagerModel.findOne({ 'userInfo.nickname': nickname })
        expect(user).not.toBeNull()
        expect(user?.userInfo.nickname).toEqual(nickname)
        expect(user?.userInfo.bio).toEqual(newBio)
        expect(user?.profilePicture.alt).toBeNull()
        expect(user?.profilePicture.url).toBe('https://example.com')
        expect(user?.languages.length).toBe(4)
        expect(user?.cv.url).toBe('https://exampleexample.com')
        expect(user?.trophies.length).toBe(2)
        expect(user?.level.grade).toEqual(rightLevel!.grade.value)
        expect(user?.level.title).toEqual(rightLevel!.title)
        expect(user?.level.xp).toEqual(rightLevel!.xpLevel)
        expect(user?.level.url).toEqual(rightLevel!.imageUrl)
      },
      timeout
    )

    it(
      'should return error because user not exist',
      async () => {
        const result = await findUser(userInfo!.nickname)
        const error = isLeft(result) ? result.left : new Error('Unknown error')
        expect(isLeft(result)).toBeTruthy()
        expect(error.message).toBe('User not found')
      },
      timeout
    )
  })

  describe('Test delete user', () => {
    it(
      'should correct delete user',
      async () => {
        await saveAdvancedUser(newUserManager!)
        await deleteUser(newUserManager!.userInfo.nickname)
        const user = await UserManagerModel.findOne({ 'userInfo.nickname': nickname })
        expect(user).toBeNull()
      },
      timeout
    )

    it('should return error because user not exist', async () => {
      const result = await deleteUser(newUserManager!.userInfo.nickname)
      const error = isLeft(result) ? result.left : new Error('Unknown error')
      expect(isLeft(result)).toBeTruthy()
      expect(error.message).toBe('User not found')
    })
  })
})
