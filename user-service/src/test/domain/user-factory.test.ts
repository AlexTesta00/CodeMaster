import {
  createAdvancedUser,
  createDefaultUser,
  createDefaultUserInfo,
  createUserInfo,
} from '../../main/nodejs/codemaster/servicies/user/domain/user-factory'
import { Language } from '../../main/nodejs/codemaster/servicies/user/domain/language'
import { Trophy } from '../../main/nodejs/codemaster/servicies/user/domain/trophy'
import {
  createDefaultLevel,
  FIRST_LEVEL_GRADE,
} from '../../main/nodejs/codemaster/servicies/user/domain/level-factory'
import { createTrophy } from '../../main/nodejs/codemaster/servicies/user/domain/trophy-factory'
import { isSome, none } from 'fp-ts/Option'
import { isLeft, isRight } from 'fp-ts/Either'
import { checkNickname } from '../../main/nodejs/codemaster/servicies/user/domain/validator'

describe('User Functions', () => {
  describe('checkNickname', () => {
    it('should pass validation and return the nickname', () => {
      const validNickname = 'valid_123'
      const result = checkNickname(validNickname)
      const rightResult = isRight(result) ? result.right : ''
      expect(isRight(result)).toBeTruthy()
      expect(rightResult).toBe(validNickname)
    })

    it('should return left error for an invalid nickname', () => {
      const invalidNickname = 'inv@lid'
      const result = checkNickname(invalidNickname)
      const errorMessage = isLeft(result) ? result.left.message : ''
      expect(isLeft(result)).toBeTruthy()
      expect(errorMessage).toEqual(
        'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
      )
    })
  })

  describe('createDefaultUserInfo', () => {
    it('should create a default user with a valid nickname', () => {
      const nickname = 'user_123'
      const user = createDefaultUserInfo(nickname)
      const userInfo = isRight(user) ? user.right : null
      expect(userInfo?.nickname.value).toBe('user_123')
      expect(userInfo?.bio).toBe(none)
    })
  })

  describe('createUserInfo', () => {
    it('should create a user with a valid nickname and bio', () => {
      const nickname = 'user_123'
      const bio = 'This is a bio'
      const user = createUserInfo(nickname, bio)
      const userInfo = isRight(user) ? user.right : null
      expect(userInfo?.nickname.value).toBe('user_123')
      expect(isSome(userInfo!.bio)).toBeTruthy()
      expect(isSome(userInfo!.bio) ? userInfo?.bio.value : null).toBe(bio)
    })

    it('should return left error for invalid nickname', () => {
      const nickname = 'inv@lid'
      const bio = 'Example for a bio'
      const user = createUserInfo(nickname, bio)
      const result = isLeft(user) ? user.left : null
      expect(result?.message).toEqual(
        'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
      )
    })
  })

  describe('createDefaultUser', () => {
    it('should create a default user manager with a valid nickname', () => {
      const nickname = 'user_123'
      const userManager = createDefaultUser(nickname)
      const result = isRight(userManager) ? userManager.right : null
      expect(result!.userInfo.nickname.value).toBe('user_123')
      expect(result!.level.grade.value).toBe(1)
      expect(result!.level.title).toBe('Novice')
      expect(isSome(result!.userInfo.bio)).not.toBeTruthy()
      expect(isSome(result!.trophies)).not.toBeTruthy()
      expect(isSome(result!.profilePicture)).not.toBeTruthy()
      expect(isSome(result!.cv)).not.toBeTruthy()
      expect(isSome(result!.languages)).not.toBeTruthy()
    })

    it('should return left error for invalid nickname', () => {
      const nickname = 'inv@lid'
      const userManager = createDefaultUser(nickname)
      const result = isLeft(userManager) ? userManager.left : null
      expect(result?.message).toEqual(
        'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
      )
    })
  })

  describe('createAdvancedUser', () => {
    it('should create an advanced user manager with all details', () => {
      const nickname = 'user_123'
      const bio = 'Advanced bio'
      const profilePicture = { url: 'https://example.com/example.png', alt: none }
      const languages: Iterable<Language> = [{ name: 'Java' }, { name: 'Kotlin' }]
      const cv = { url: 'https://example.com/example.pdf' }
      const trophy = createTrophy(
        'First Win',
        'Won your first game',
        'https://example.com/trophy.png',
        100
      )
      const rightTrophy = isRight(trophy) ? trophy.right : null
      const trophies: Iterable<Trophy> = [rightTrophy!]
      const level = createDefaultLevel()
      const rightLevel = isRight(level) ? level.right : null
      const userManager = createAdvancedUser(
        nickname,
        bio,
        profilePicture,
        languages,
        cv,
        trophies,
        rightLevel!
      )
      const result = isRight(userManager) ? userManager.right : null

      expect(result!.userInfo.nickname.value).toBe('user_123')
      expect(isSome(result!.userInfo.bio) ? result!.userInfo.bio.value : null).toBe(
        'Advanced bio'
      )
      expect(isSome(result!.profilePicture)).toBeTruthy()
      expect(
        isSome(result!.profilePicture) ? result?.profilePicture.value.url : null
      ).toBe('https://example.com/example.png')
      expect(isSome(result!.languages)).toBeTruthy()
      expect(
        isSome(result!.languages) ? Array.from(result!.languages.value).length : null
      ).toBe(2)
      expect(isSome(result!.cv)).toBeTruthy()
      expect(isSome(result!.cv) ? result!.cv.value.url : null).toBe(
        'https://example.com/example.pdf'
      )
      expect(isSome(result!.trophies)).toBeTruthy()
      expect(
        isSome(result!.trophies) ? Array.from(result!.trophies.value).length : null
      ).toBe(1)
      expect(result!.level.grade.value).toBe(FIRST_LEVEL_GRADE)
    })

    it('should return left error for an invalid profile picture url', () => {
      const level = createDefaultLevel()
      const rightLevel = isRight(level) ? level.right : null
      const userManager = createAdvancedUser(
        'user',
        'bio',
        { url: '//example.com', alt: none },
        [],
        { url: 'https://example.com' },
        [],
        rightLevel!
      )
      const result = isLeft(userManager) ? userManager.left.message : null
      expect(result).toEqual('Invalid URL format')
    })

    it('should return left error for an invalid cv url', () => {
      const level = createDefaultLevel()
      const rightLevel = isRight(level) ? level.right : null
      const userManager = createAdvancedUser(
        'user',
        'bio',
        { url: 'https://example.com', alt: none },
        [],
        { url: '//example.com' },
        [],
        rightLevel!
      )
      const result = isLeft(userManager) ? userManager.left.message : null
      expect(result).toEqual('Invalid URL format')
    })
  })
})
