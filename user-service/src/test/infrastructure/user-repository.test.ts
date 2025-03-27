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
  saveAdvancedUser,
  saveDefaultUser,
  updateUserInfo,
} from '../../main/nodejs/codemaster/servicies/user/infrastructure/user-repository'
import { isLeft, isRight } from 'fp-ts/Either'
import {
  toUserManager,
  toUserManagerModel,
} from '../../main/nodejs/codemaster/servicies/user/infrastructure/conversion'

let mongoMemoryServer: MongoMemoryServer
const timeout: number = 10000
const nickname: string = 'example'
const bio: string = 'Test bio'
const profilePicture = { url: 'https://example.com', alt: none }
const languages = [{ name: 'Kotlin' }, { name: 'Scala' }, { name: 'Python' }]
const cv = { url: 'https://example.com' }
const trophies = [createTrophy('First', 'First trophy', 'https://example.com', 1)]
const level = createDefaultLevel()
const newUserInfo = createUserInfo(nickname, bio)
const newUser: UserManager = createAdvancedUser(
  nickname,
  bio,
  profilePicture,
  languages,
  cv,
  trophies,
  level
)

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

  describe('Test toUserManagerModel and toUserManager', () => {
    it(
      'should correctly convert UserManager to UserManagerModel and vice versa',
      () => {
        const userManagerModel = toUserManagerModel(newUser)
        const convertedUserManager = toUserManager(userManagerModel)
        const convertedLanguages = isSome(convertedUserManager.languages)
          ? convertedUserManager.languages.value
          : []
        const convertedTrophies = isSome(convertedUserManager.trophies)
          ? convertedUserManager.trophies.value
          : []
        const convertedCV = isSome(convertedUserManager.cv)
          ? convertedUserManager.cv.value
          : { url: '' }
        expect(userManagerModel.userInfo.nickname).toEqual(nickname)
        expect(userManagerModel.userInfo.bio).toEqual(bio)
        expect(userManagerModel.profilePicture.url).toEqual('https://example.com')
        expect(userManagerModel.profilePicture.alt).toBeNull()
        expect(userManagerModel.languages.length).toEqual(3)
        expect(userManagerModel.cv.url).toEqual('https://example.com')
        expect(userManagerModel.trophies.length).toEqual(1)
        expect(userManagerModel.level.grade).toEqual(level.grade.value)
        expect(userManagerModel.level.title).toEqual(level.title)
        expect(userManagerModel.level.xp).toEqual(level.xpLevel)
        expect(convertedUserManager.userInfo.nickname).toEqual(newUser.userInfo.nickname)
        expect(convertedUserManager.userInfo.bio).toEqual(newUser.userInfo.bio)
        expect(convertedUserManager.profilePicture).toEqual(newUser.profilePicture)
        expect(Array.from(convertedLanguages).map((language) => language.name)).toEqual(
          languages.map((language) => language.name)
        )
        expect(convertedCV.url).toEqual(cv.url)
        expect(convertedTrophies).toEqual(trophies)
        expect(convertedUserManager.level).toEqual(level)
      },
      timeout
    )
  })

  describe('Test save user', () => {
    it(
      'should save a default user',
      async () => {
        await saveDefaultUser(newUserInfo)
        const user = await UserManagerModel.findOne({ 'userInfo.nickname': nickname })
        expect(user).not.toBeNull()
        expect(user?.userInfo.nickname).toEqual(nickname)
        expect(user?.userInfo.bio).toEqual('')
        expect(user?.profilePicture.alt).toBeNull()
        expect(user?.profilePicture.url).toBe('')
        expect(user?.languages.length).toBe(0)
        expect(user?.cv.url).toBe('')
        expect(user?.trophies.length).toBe(0)
        expect(user?.level.grade).toEqual(level.grade.value)
        expect(user?.level.title).toEqual(level.title)
        expect(user?.level.xp).toEqual(level.xpLevel)
      },
      timeout
    )

    it(
      'should save an advanced user',
      async () => {
        await saveAdvancedUser(newUser)
        const user = await UserManagerModel.findOne({ 'userInfo.nickname': nickname })
        expect(user).not.toBeNull()
        expect(user?.userInfo.nickname).toEqual(nickname)
        expect(user?.userInfo.bio).toEqual(bio)
        expect(user?.profilePicture.alt).toBeNull()
        expect(user?.profilePicture.url).toBe('https://example.com')
        expect(user?.languages.length).toBe(3)
        expect(user?.cv.url).toBe('https://example.com')
        expect(user?.trophies.length).toBe(1)
        expect(user?.level.grade).toEqual(level.grade.value)
        expect(user?.level.title).toEqual(level.title)
        expect(user?.level.xp).toEqual(level.xpLevel)
      },
      timeout
    )

    it(
      'should reject saving a user with the same nickname',
      async () => {
        await saveDefaultUser(newUserInfo)
        const result2 = await saveDefaultUser(newUserInfo)
        expect(isLeft(result2)).toBeTruthy()
      },
      timeout
    )
  })

  describe('Test find user', () => {
    it(
      'should return correct user info',
      async () => {
        await saveAdvancedUser(newUser)
        const result = await findUser(newUserInfo.nickname)
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
        expect(resultUserLevel).toEqual(level)
      },
      timeout
    )

    it(
      'should return error because user not exist',
      async () => {
        const result = await findUser(newUserInfo.nickname)
        const error = isLeft(result) ? result.left : new Error('Unknown error')
        expect(isLeft(result)).toBeTruthy()
        expect(error.message).toBe('User not found')
      },
      timeout
    )
  })

  describe('Test update user info', () => {
    it(
      'should update user info',
      async () => {
        await saveAdvancedUser(newUser)
        const newBio = 'New bio'
        const newLanguages = [...languages, { name: 'Java' }]
        const newCV = { url: 'https://exampleexample.com' }
        const newTrophy = [
          ...trophies,
          createTrophy('Second', 'Second trophy', 'https://example2.com', 2),
        ]
        const updatedInfo = createAdvancedUser(
          nickname,
          newBio,
          profilePicture,
          newLanguages,
          newCV,
          newTrophy,
          level
        )
        await updateUserInfo(newUserInfo.nickname, updatedInfo)
        const user = await UserManagerModel.findOne({ 'userInfo.nickname': nickname })
        expect(user).not.toBeNull()
        expect(user?.userInfo.nickname).toEqual(nickname)
        expect(user?.userInfo.bio).toEqual(newBio)
        expect(user?.profilePicture.alt).toBeNull()
        expect(user?.profilePicture.url).toBe('https://example.com')
        expect(user?.languages.length).toBe(4)
        expect(user?.cv.url).toBe('https://exampleexample.com')
        expect(user?.trophies.length).toBe(2)
        expect(user?.level.grade).toEqual(level.grade.value)
        expect(user?.level.title).toEqual(level.title)
        expect(user?.level.xp).toEqual(level.xpLevel)
      },
      timeout
    )

    it(
      'should return error because user not exist',
      async () => {
        const result = await findUser(newUserInfo.nickname)
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
        await saveAdvancedUser(newUser)
        await deleteUser(newUser.userInfo.nickname)
        const user = await UserManagerModel.findOne({ 'userInfo.nickname': nickname })
        expect(user).toBeNull()
      },
      timeout
    )

    it('should return error because user not exist', async () => {
      const result = await deleteUser(newUser.userInfo.nickname)
      const error = isLeft(result) ? result.left : new Error('Unknown error')
      expect(isLeft(result)).toBeTruthy()
      expect(error.message).toBe('User not found')
    })
  })
})
