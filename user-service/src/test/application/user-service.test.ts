import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import {
  LevelModel,
  TrophyModel,
  UserManagerModel,
} from '../../main/nodejs/codemaster/servicies/user/infrastructure/schema'
import { UserId } from '../../main/nodejs/codemaster/servicies/user/domain/user'
import {
  changeUserBio,
  changeUserCV,
  changeUserLanguages,
  changeUserProfilePicture,
  changeUserTrophy,
  computeUserLevel,
  deleteLevel,
  deleteTrophy,
  getAllLevels,
  getAllTrophies,
  getAllUserInfo,
  registerNewLevel,
  registerNewTrophy,
  registerNewUser,
} from '../../main/nodejs/codemaster/servicies/user/application/user-service'
import { isLeft, isRight } from 'fp-ts/Either'
import { isNone, isSome, none, some } from 'fp-ts/Option'
import { createDefaultLevel } from '../../main/nodejs/codemaster/servicies/user/domain/level-factory'
import { CV } from '../../main/nodejs/codemaster/servicies/user/domain/cv'
import { Language } from '../../main/nodejs/codemaster/servicies/user/domain/language'
import {
  Trophy,
  TrophyId,
} from '../../main/nodejs/codemaster/servicies/user/domain/trophy'
import { ProfilePicture } from '../../main/nodejs/codemaster/servicies/user/domain/profile-picture'
import { LevelId } from '../../main/nodejs/codemaster/servicies/user/domain/level'
import { createTrophy } from '../../main/nodejs/codemaster/servicies/user/domain/trophy-factory'

let mongoMemoryServer: MongoMemoryServer
const timeout: number = 10000
const nickname: UserId = { value: 'example' }
const invalidNickname: UserId = { value: 'inv@lid' }
const defaultLevel = createDefaultLevel()
const rightDefaultLevel = isRight(defaultLevel) ? defaultLevel.right : null

describe('Test user service', () => {
  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    const uri = mongoMemoryServer.getUri()
    await mongoose.connect(uri)
  }, timeout)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoMemoryServer.stop()
  }, timeout)

  beforeEach(async () => {
    await UserManagerModel.deleteMany({})
    await TrophyModel.deleteMany({})
    await LevelModel.deleteMany({})
  }, timeout)

  describe('Test register new user', () => {
    it(
      'should correct save new user',
      async () => {
        const saveUser = await registerNewUser(nickname)
        expect(isRight(saveUser)).toBeTruthy()

        const result = isRight(saveUser) ? saveUser.right : null
        expect(result!.userInfo.nickname.value).toEqual(nickname.value)
        expect(isNone(result!.userInfo.bio)).toBeTruthy()
        expect(isNone(result!.cv)).toBeTruthy()
        expect(isNone(result!.profilePicture)).toBeTruthy()
        expect(isNone(result!.languages)).toBeTruthy()
        expect(isNone(result!.trophies)).toBeTruthy()
        expect(result?.level.grade.value).toEqual(rightDefaultLevel!.grade.value)
        expect(result?.level.title).toEqual(rightDefaultLevel!.title)
        expect(result?.level.xpLevel).toEqual(rightDefaultLevel!.xpLevel)
      },
      timeout
    )

    it(
      'should return left error because nickname is not in a valid format',
      async () => {
        const saveUser = await registerNewUser(invalidNickname)
        expect(isLeft(saveUser)).toBeTruthy()

        const error = isLeft(saveUser) ? saveUser.left : null
        expect(error!.message).toEqual(
          'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
        )
      },
      timeout
    )

    it(
      'should return left error because repository save fail',
      async () => {
        const originalSave = UserManagerModel.prototype.save

        UserManagerModel.prototype.save = jest
          .fn()
          .mockRejectedValue(new Error('Database connection failed'))
        const saveUser = await registerNewUser(nickname)
        expect(isLeft(saveUser)).toBeTruthy()

        const error = isLeft(saveUser) ? saveUser.left : null
        expect(error!.message).toEqual('Database connection failed')

        UserManagerModel.prototype.save = originalSave
      },
      timeout
    )
  })

  describe('Test getAllUserInfo', () => {
    it(
      'should correct find user and return correct user info',
      async () => {
        await registerNewUser(nickname)
        const foundUser = await getAllUserInfo(nickname)
        expect(isRight(foundUser)).toBeTruthy()
        const rightFoundUser = isRight(foundUser) ? foundUser.right : null
        expect(rightFoundUser!.userInfo.nickname.value).toEqual(nickname.value)
        expect(isNone(rightFoundUser!.userInfo.bio)).toBeTruthy()
        expect(isNone(rightFoundUser!.cv)).toBeTruthy()
        expect(isNone(rightFoundUser!.profilePicture)).toBeTruthy()
        expect(isNone(rightFoundUser!.languages)).toBeTruthy()
        expect(isNone(rightFoundUser!.trophies)).toBeTruthy()
        expect(rightFoundUser?.level.grade.value).toEqual(rightDefaultLevel!.grade.value)
        expect(rightFoundUser?.level.title).toEqual(rightDefaultLevel!.title)
        expect(rightFoundUser?.level.xpLevel).toEqual(rightDefaultLevel!.xpLevel)
      },
      timeout
    )

    it(
      'should fail because user not exist',
      async () => {
        const foundUser = await getAllUserInfo(nickname)
        expect(isLeft(foundUser)).toBeTruthy()

        const error = isLeft(foundUser) ? foundUser.left : null
        expect(error!.message).toEqual('User not found')
      },
      timeout
    )
  })

  describe('Test changeUserBio', () => {
    it(
      'should return a correct userManager with new bio',
      async () => {
        await registerNewUser(nickname)
        const newBio: string = 'Test bio'
        const updatedUser = await changeUserBio(nickname, newBio)
        expect(isRight(updatedUser)).toBeTruthy()
        const rightUpdatedUser = isRight(updatedUser) ? updatedUser.right : null
        expect(rightUpdatedUser!.userInfo.nickname.value).toEqual(nickname.value)
        expect(isSome(rightUpdatedUser!.userInfo.bio)).toBeTruthy()
        expect(
          isSome(rightUpdatedUser!.userInfo.bio) &&
            rightUpdatedUser!.userInfo.bio.value === newBio
        ).toBeTruthy()
        expect(isNone(rightUpdatedUser!.cv)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.profilePicture)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.languages)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.trophies)).toBeTruthy()
        expect(rightUpdatedUser?.level.grade.value).toEqual(
          rightDefaultLevel!.grade.value
        )
        expect(rightUpdatedUser?.level.title).toEqual(rightDefaultLevel!.title)
        expect(rightUpdatedUser?.level.xpLevel).toEqual(rightDefaultLevel!.xpLevel)
      },
      timeout
    )

    it(
      'should return error because user not exist',
      async () => {
        const newBio: string = 'Test bio'
        const updatedUser = await changeUserBio(nickname, newBio)
        expect(isLeft(updatedUser)).toBeTruthy()

        const error = isLeft(updatedUser) ? updatedUser.left : null
        expect(error!.message).toEqual('User not found')
      },
      timeout
    )

    it(
      'should return none bio, if newBio value is an empty string',
      async () => {
        await registerNewUser(nickname)
        const newBio: string = ''
        const updatedUser = await changeUserBio(nickname, newBio)
        expect(isRight(updatedUser)).toBeTruthy()

        const rightUser = isRight(updatedUser) ? updatedUser.right : null
        expect(isNone(rightUser!.userInfo.bio)).toBeTruthy()
      },
      timeout
    )
  })

  describe('Test change changeUserProfilePicture', () => {
    it(
      'should return a correct user with new profile picture with empty alt',
      async () => {
        const newProfilePicture = { url: 'https://example.com', alt: none }
        await registerNewUser(nickname)
        const updatedUser = await changeUserProfilePicture(nickname, newProfilePicture)
        expect(isRight(updatedUser)).toBeTruthy()

        const rightUpdatedUser = isRight(updatedUser) ? updatedUser.right : null
        expect(rightUpdatedUser!.userInfo.nickname.value).toEqual(nickname.value)
        expect(isNone(rightUpdatedUser!.userInfo.bio)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.cv)).toBeTruthy()
        expect(
          isSome(rightUpdatedUser!.profilePicture) &&
            rightUpdatedUser?.profilePicture.value.url == 'https://example.com' &&
            isNone(rightUpdatedUser.profilePicture.value.alt)
        ).toBeTruthy()
        expect(isNone(rightUpdatedUser!.languages)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.trophies)).toBeTruthy()
        expect(rightUpdatedUser?.level.grade.value).toEqual(
          rightDefaultLevel!.grade.value
        )
        expect(rightUpdatedUser?.level.title).toEqual(rightDefaultLevel!.title)
        expect(rightUpdatedUser?.level.xpLevel).toEqual(rightDefaultLevel!.xpLevel)
      },
      timeout
    )

    it(
      'should return a correct user with new profile picture with alt',
      async () => {
        const newProfilePicture = { url: 'https://example.com', alt: some('alt text') }
        await registerNewUser(nickname)
        const updatedUser = await changeUserProfilePicture(nickname, newProfilePicture)
        expect(isRight(updatedUser)).toBeTruthy()

        const rightUpdatedUser = isRight(updatedUser) ? updatedUser.right : null
        expect(rightUpdatedUser!.userInfo.nickname.value).toEqual(nickname.value)
        expect(isNone(rightUpdatedUser!.userInfo.bio)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.cv)).toBeTruthy()
        expect(
          isSome(rightUpdatedUser!.profilePicture) &&
            rightUpdatedUser?.profilePicture.value.url == 'https://example.com' &&
            isSome(rightUpdatedUser.profilePicture.value.alt) &&
            rightUpdatedUser?.profilePicture.value.alt.value == 'alt text'
        ).toBeTruthy()
        expect(isNone(rightUpdatedUser!.languages)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.trophies)).toBeTruthy()
        expect(rightUpdatedUser?.level.grade.value).toEqual(
          rightDefaultLevel!.grade.value
        )
        expect(rightUpdatedUser?.level.title).toEqual(rightDefaultLevel!.title)
        expect(rightUpdatedUser?.level.xpLevel).toEqual(rightDefaultLevel!.xpLevel)
      },
      timeout
    )

    it(
      'should return error because user not exist',
      async () => {
        const updatedUser = await changeUserProfilePicture(invalidNickname, {
          url: 'https://example.com',
          alt: none,
        })
        expect(isLeft(updatedUser)).toBeTruthy()

        const error = isLeft(updatedUser) ? updatedUser.left : null
        expect(error!.message).toEqual('User not found')
      },
      timeout
    )

    it(
      'should return none profilePicture, if newProfilePicture value is an empty string',
      async () => {
        await registerNewUser(nickname)
        const newProfilePicture: ProfilePicture = { url: '', alt: none }
        const updatedUser = await changeUserProfilePicture(nickname, newProfilePicture)
        expect(isRight(updatedUser)).toBeTruthy()

        const rightUser = isRight(updatedUser) ? updatedUser.right : null
        expect(isNone(rightUser!.profilePicture)).toBeTruthy()
      },
      timeout
    )
  })

  describe('Test changeUserCV', () => {
    it(
      'should return a correct userManager with new CV',
      async () => {
        await registerNewUser(nickname)
        const newCV: CV = { url: 'https://example.com/cv.pdf' }
        const updatedUser = await changeUserCV(nickname, newCV)
        expect(isRight(updatedUser)).toBeTruthy()

        const rightUpdatedUser = isRight(updatedUser) ? updatedUser.right : null
        expect(rightUpdatedUser!.userInfo.nickname.value).toEqual(nickname.value)
        expect(isNone(rightUpdatedUser!.userInfo.bio)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.profilePicture)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.languages)).toBeTruthy()
        expect(isSome(rightUpdatedUser!.cv)).toBeTruthy()
        expect(
          isSome(rightUpdatedUser!.cv) &&
            rightUpdatedUser!.cv.value.url === 'https://example.com/cv.pdf'
        ).toBeTruthy()
        expect(isNone(rightUpdatedUser!.trophies)).toBeTruthy()
        expect(rightUpdatedUser?.level.grade.value).toEqual(
          rightDefaultLevel!.grade.value
        )
        expect(rightUpdatedUser?.level.title).toEqual(rightDefaultLevel!.title)
        expect(rightUpdatedUser?.level.xpLevel).toEqual(rightDefaultLevel!.xpLevel)
      },
      timeout
    )

    it(
      'should return error because user not exist',
      async () => {
        const newCV: CV = { url: 'https://example.com/cv.pdf' }
        const updatedUser = await changeUserCV(invalidNickname, newCV)
        expect(isLeft(updatedUser)).toBeTruthy()

        const error = isLeft(updatedUser) ? updatedUser.left : null
        expect(error!.message).toEqual('User not found')
      },
      timeout
    )

    it(
      'should return none cv, if newCV value is an empty string',
      async () => {
        await registerNewUser(nickname)
        const newCV: CV = { url: '' }
        const updatedUser = await changeUserCV(nickname, newCV)
        expect(isRight(updatedUser)).toBeTruthy()

        const rightUser = isRight(updatedUser) ? updatedUser.right : null
        expect(isNone(rightUser!.cv)).toBeTruthy()
      },
      timeout
    )
  })

  describe('Test changeUserLanguages', () => {
    it(
      'should return a correct userManager with new languages',
      async () => {
        await registerNewUser(nickname)
        const newLanguages: Language[] = [{ name: 'JavaScript' }]
        const updatedUser = await changeUserLanguages(nickname, newLanguages)
        expect(isRight(updatedUser)).toBeTruthy()

        const rightUpdatedUser = isRight(updatedUser) ? updatedUser.right : null
        expect(rightUpdatedUser!.userInfo.nickname.value).toEqual(nickname.value)
        expect(isNone(rightUpdatedUser!.userInfo.bio)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.profilePicture)).toBeTruthy()
        expect(isSome(rightUpdatedUser!.languages)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.cv)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.trophies)).toBeTruthy()
        expect(
          isSome(rightUpdatedUser!.languages) &&
            Array.from(rightUpdatedUser!.languages.value).length === 1
        ).toBeTruthy()
        expect(rightUpdatedUser?.level.grade.value).toEqual(
          rightDefaultLevel!.grade.value
        )
        expect(rightUpdatedUser?.level.title).toEqual(rightDefaultLevel!.title)
        expect(rightUpdatedUser?.level.xpLevel).toEqual(rightDefaultLevel!.xpLevel)
      },
      timeout
    )

    it(
      'should return a correct userManager with empty languages when empty array is passed',
      async () => {
        await registerNewUser(nickname)
        const newLanguages: Language[] = []
        const updatedUser = await changeUserLanguages(nickname, newLanguages)
        expect(isRight(updatedUser)).toBeTruthy()

        const rightUpdatedUser = isRight(updatedUser) ? updatedUser.right : null
        expect(isNone(rightUpdatedUser!.languages)).toBeTruthy()
      },
      timeout
    )

    it(
      'should return error because user not exist',
      async () => {
        const newLanguages: Language[] = [{ name: 'JavaScript' }]
        const updatedUser = await changeUserLanguages(invalidNickname, newLanguages)
        expect(isLeft(updatedUser)).toBeTruthy()

        const error = isLeft(updatedUser) ? updatedUser.left : null
        expect(error!.message).toEqual('User not found')
      },
      timeout
    )
  })

  describe('Test changeUserTrophy', () => {
    it(
      'should return a correct userManager with new trophies',
      async () => {
        await registerNewUser(nickname)
        const newTrophies: Trophy[] = [
          {
            title: { value: 'trophy-example' },
            description: 'Description',
            url: 'https://example.com',
            xp: 1,
          },
        ]
        const updatedUser = await changeUserTrophy(nickname, newTrophies)
        expect(isRight(updatedUser)).toBeTruthy()

        const rightUpdatedUser = isRight(updatedUser) ? updatedUser.right : null
        expect(rightUpdatedUser!.userInfo.nickname.value).toEqual(nickname.value)
        expect(isNone(rightUpdatedUser!.userInfo.bio)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.profilePicture)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.languages)).toBeTruthy()
        expect(isNone(rightUpdatedUser!.cv)).toBeTruthy()
        expect(isSome(rightUpdatedUser!.trophies)).toBeTruthy()
        expect(
          isSome(rightUpdatedUser!.trophies) &&
            Array.from(rightUpdatedUser!.trophies.value).length === 1
        ).toBeTruthy()
        expect(rightUpdatedUser?.level.grade.value).toEqual(
          rightDefaultLevel!.grade.value
        )
        expect(rightUpdatedUser?.level.title).toEqual(rightDefaultLevel!.title)
        expect(rightUpdatedUser?.level.xpLevel).toEqual(rightDefaultLevel!.xpLevel)
      },
      timeout
    )

    it(
      'should return a correct userManager with empty trophies when empty array is passed',
      async () => {
        await registerNewUser(nickname)
        const newTrophies: Trophy[] = []
        const updatedUser = await changeUserTrophy(nickname, newTrophies)
        expect(isRight(updatedUser)).toBeTruthy()

        const rightUpdatedUser = isRight(updatedUser) ? updatedUser.right : null
        expect(isNone(rightUpdatedUser!.trophies)).toBeTruthy()
      },
      timeout
    )

    it(
      'should return error because user not exist',
      async () => {
        const newTrophies: Trophy[] = [
          {
            title: { value: 'example-of-trophy' },
            description: 'Description',
            url: 'https://example.com',
            xp: 1,
          },
        ]
        const updatedUser = await changeUserTrophy(invalidNickname, newTrophies)
        expect(isLeft(updatedUser)).toBeTruthy()

        const error = isLeft(updatedUser) ? updatedUser.left : null
        expect(error!.message).toEqual('User not found')
      },
      timeout
    )

    it(
      'should correctly concat old trophies with new trophies',
      async () => {
        await registerNewUser(nickname)
        const trophy1 = createTrophy(
          'First Trophy',
          'First trophy',
          'https://example.com/1',
          100
        )
        const trophy2 = createTrophy(
          'Second Trophy',
          'Second trophy',
          'https://example.com/2',
          200
        )
        const expected = [trophy1, trophy2].filter(isRight).map((trophy) => trophy.right)
        if (isRight(trophy1) && isRight(trophy2)) {
          const resultFirstChange = await changeUserTrophy(nickname, [trophy1.right])
          expect(isRight(resultFirstChange)).toBeTruthy()
          const resultSecondChange = await changeUserTrophy(nickname, [trophy2.right])
          expect(isRight(resultSecondChange)).toBeTruthy()
          const foundUser = await getAllUserInfo(nickname)
          expect(isRight(foundUser)).toBeTruthy()
          const rightFoundUser = isRight(foundUser) ? foundUser.right : null
          const trophyOfFoundUser = isSome(rightFoundUser!.trophies)
            ? Array.from(rightFoundUser!.trophies.value)
            : null
          expect(trophyOfFoundUser![0]).toEqual(expected[1])
          expect(trophyOfFoundUser![1]).toEqual(expected[0])
        } else {
          fail()
        }
      },
      timeout
    )
  })

  describe('Test registerNewTrophy', () => {
    it(
      'should correctly save a new trophy',
      async () => {
        const trophyId: TrophyId = { value: 'code-master' }
        const description = 'Master of code'
        const url = 'https://example.com/trophy'
        const xp = 100

        const result = await registerNewTrophy(trophyId, description, url, xp)
        expect(isRight(result)).toBeTruthy()

        const trophy = isRight(result) ? result.right : null
        expect(trophy?.title.value).toEqual(trophyId.value)
        expect(trophy?.description).toEqual(description)
        expect(trophy?.url).toEqual(url)
        expect(trophy?.xp).toEqual(xp)
      },
      timeout
    )

    it(
      'should return error for invalid trophy data',
      async () => {
        const invalidTrophyId: TrophyId = { value: '' }
        const description = 'Master of code'
        const url = 'https://example.com/trophy'
        const xp = 100

        const result = await registerNewTrophy(invalidTrophyId, description, url, xp)
        expect(isLeft(result)).toBeTruthy()
      },
      timeout
    )
  })

  describe('Test deleteTrophy', () => {
    it(
      'should correctly delete a trophy',
      async () => {
        const trophyId: TrophyId = { value: 'code-master' }
        const registerResult = await registerNewTrophy(
          trophyId,
          'description',
          'url',
          100
        )
        expect(isRight(registerResult)).toBeTruthy()

        const deleteResult = await deleteTrophy(trophyId)
        expect(isRight(deleteResult)).toBeTruthy()

        const getAllResult = await getAllTrophies()
        expect(isRight(getAllResult)).toBeTruthy()
        if (isRight(getAllResult)) {
          const trophies = Array.from(getAllResult.right)
          expect(trophies.length).toBe(0)
        }
      },
      timeout
    )

    it(
      'should return error when trying to delete non-existent trophy',
      async () => {
        const trophyId: TrophyId = { value: 'non-existent' }
        const result = await deleteTrophy(trophyId)
        expect(isLeft(result)).toBeTruthy()
      },
      timeout
    )
  })

  describe('Test getAllTrophies', () => {
    it(
      'should return all trophies',
      async () => {
        const trophy_one = await registerNewTrophy(
          { value: 'trophy1' },
          'desc1',
          'url1',
          100
        )
        const trophy_two = await registerNewTrophy(
          { value: 'trophy2' },
          'desc2',
          'url2',
          200
        )
        const expected = [trophy_one, trophy_two]
          .filter(isRight)
          .map((trophy) => trophy.right)
        const result = await getAllTrophies()
        expect(isRight(result)).toBeTruthy()

        if (isRight(result)) expect(Array.from(result.right)).toEqual(expected)
      },
      timeout
    )

    it(
      'should return empty iterable when no trophies exist',
      async () => {
        const result = await getAllTrophies()
        expect(isRight(result)).toBeTruthy()

        if (isRight(result)) {
          const trophies = Array.from(result.right)
          expect(trophies.length).toBe(0)
        }
      },
      timeout
    )
  })

  describe('Test registerNewLevel', () => {
    it(
      'should correctly save a new level',
      async () => {
        const levelId: LevelId = { value: 2 }
        const title = 'Intermediate'
        const xpLevel = 500

        const result = await registerNewLevel(levelId, title, xpLevel)
        expect(isRight(result)).toBeTruthy()

        const level = isRight(result) ? result.right : null
        expect(level?.grade.value).toEqual(levelId.value)
        expect(level?.title).toEqual(title)
        expect(level?.xpLevel).toEqual(xpLevel)
      },
      timeout
    )

    it(
      'should return error for invalid level data',
      async () => {
        const levelId: LevelId = { value: -1 }
        const title = 'Invalid'
        const xpLevel = -100

        const result = await registerNewLevel(levelId, title, xpLevel)
        expect(isLeft(result)).toBeTruthy()
      },
      timeout
    )
  })

  describe('Test deleteLevel', () => {
    it(
      'should correctly delete a level',
      async () => {
        const levelId: LevelId = { value: 2 }
        const registerResult = await registerNewLevel(levelId, 'Intermediate', 500)
        expect(isRight(registerResult)).toBeTruthy()

        const deleteResult = await deleteLevel(levelId)
        expect(isRight(deleteResult)).toBeTruthy()

        const getAllResult = await getAllLevels()
        expect(isRight(getAllResult)).toBeTruthy()
        if (isRight(getAllResult)) {
          const levels = Array.from(getAllResult.right)
          expect(levels.length).toBe(0)
        }
      },
      timeout
    )

    it(
      'should return error when trying to delete non-existent level',
      async () => {
        const levelId: LevelId = { value: 999 }
        const result = await deleteLevel(levelId)
        expect(isLeft(result)).toBeTruthy()
      },
      timeout
    )
  })

  describe('Test getAllLevels', () => {
    it(
      'should return all levels',
      async () => {
        const level_one = await registerNewLevel({ value: 1 }, 'Beginner', 100)
        const level_two = await registerNewLevel({ value: 2 }, 'Intermediate', 500)
        const expected = [level_one, level_two]
          .filter(isRight)
          .map((level) => level.right)

        const result = await getAllLevels()
        expect(isRight(result)).toBeTruthy()

        if (isRight(result)) expect(result.right).toEqual(expected)
      },
      timeout
    )

    it(
      'should return empty iterable when no levels exist',
      async () => {
        const result = await getAllLevels()
        expect(isRight(result)).toBeTruthy()

        if (isRight(result)) {
          const levels = Array.from(result.right)
          expect(levels.length).toBe(0)
        }
      },
      timeout
    )
  })

  describe('Test computeUserLevel', () => {
    it(
      'should compute correct user level based on trophies XP',
      async () => {
        const userId: UserId = { value: nickname.value }
        await registerNewUser(userId)

        const first_trophy = await registerNewTrophy(
          { value: 't1' },
          'desc1',
          'url1',
          200
        )
        const second_trophy = await registerNewTrophy(
          { value: 't2' },
          'desc2',
          'url2',
          400
        )

        await registerNewLevel({ value: 1 }, 'Beginner', 100)
        await registerNewLevel({ value: 2 }, 'Intermediate', 500)
        await registerNewLevel({ value: 3 }, 'Advanced', 1000)

        const trophies = [first_trophy, second_trophy]
          .filter(isRight)
          .map((trophy) => trophy.right)
        await changeUserTrophy(userId, trophies)
        const computeLevel = await computeUserLevel(userId)
        expect(isRight(computeLevel)).toBeTruthy()

        if (isRight(computeLevel)) {
          expect(computeLevel.right.title).toEqual('Intermediate')
          expect(computeLevel.right.xpLevel).toEqual(500)
          expect(computeLevel.right.grade.value).toEqual(2)
        }
      },
      timeout
    )

    it(
      'should return error when user has no trophies',
      async () => {
        const userId: UserId = { value: nickname.value }
        await registerNewUser(userId)

        await registerNewLevel({ value: 1 }, 'Beginner', 100)
        await registerNewLevel({ value: 2 }, 'Intermediate', 500)
        await registerNewLevel({ value: 3 }, 'Advanced', 1000)

        const result = await computeUserLevel(userId)
        expect(isLeft(result)).toBeTruthy()
        if (isLeft(result)) {
          expect(result.left.message).toBe('User trophy none')
        }
      },
      timeout
    )

    it(
      'should return max level if user has max level trophies',
      async () => {
        const userId: UserId = { value: nickname.value }
        await registerNewUser(userId)

        await registerNewLevel({ value: 1 }, 'Beginner', 100)
        await registerNewLevel({ value: 2 }, 'Intermediate', 500)
        await registerNewLevel({ value: 3 }, 'Advanced', 1000)

        const trophy = createTrophy(
          'millionare',
          'you have rached max level',
          'https://localhost.com',
          2000
        )
        const rightTrophy = isRight(trophy) ? trophy.right : null
        await changeUserTrophy(userId, [rightTrophy!])

        const result = await computeUserLevel(userId)
        expect(isRight(result)).toBeTruthy()
        if (isRight(result)) {
          expect(result.right.title).toEqual('Advanced')
          expect(result.right.xpLevel).toEqual(1000)
          expect(result.right.grade.value).toEqual(3)
        }
      },
      timeout
    )

    it(
      'should return min level if user has min level trophies',
      async () => {
        const userId: UserId = { value: nickname.value }
        await registerNewUser(userId)

        await registerNewLevel({ value: 1 }, 'Beginner', 1)
        await registerNewLevel({ value: 2 }, 'Intermediate', 500)
        await registerNewLevel({ value: 3 }, 'Advanced', 1000)

        const trophy = createTrophy(':(', 'loser', 'https://localhost.com', 1)
        const rightTrophy = isRight(trophy) ? trophy.right : null
        await changeUserTrophy(userId, [rightTrophy!])

        const result = await computeUserLevel(userId)
        expect(isRight(result)).toBeTruthy()
        if (isRight(result)) {
          expect(result.right.title).toEqual('Beginner')
          expect(result.right.xpLevel).toEqual(1)
          expect(result.right.grade.value).toEqual(1)
        }
      },
      timeout
    )

    it(
      'should return error when user does not exist',
      async () => {
        const userId: UserId = { value: 'nonexist' }
        const result = await computeUserLevel(userId)
        expect(isLeft(result)).toBeTruthy()
      },
      timeout
    )
  })
})
