import {
  createAdvancedUser,
  createDefaultUser,
  createDefaultUserInfo,
  createUserInfo,
} from '../../main/nodejs/codemaster/servicies/user/domain/user-factory'
import { Language } from '../../main/nodejs/codemaster/servicies/user/domain/language'
import { Trophy } from '../../main/nodejs/codemaster/servicies/user/domain/trophy'
import { checkNicknameOrThrowError } from '../../main/nodejs/codemaster/servicies/user/domain/validator'
import {
  createDefaultLevel,
  FIRST_LEVEL_GRADE,
} from '../../main/nodejs/codemaster/servicies/user/domain/level-factory'
import { createTrophy } from '../../main/nodejs/codemaster/servicies/user/domain/trophy-factory'

describe('User Functions', () => {
  describe('checkNicknameOrThrowError', () => {
    it('should not throw an error for a valid nickname', () => {
      const validNickname = 'valid_123'
      expect(() => checkNicknameOrThrowError(validNickname)).not.toThrow()
    })

    it('should throw an error for an invalid nickname', () => {
      const invalidNickname = 'inv@lid'
      expect(() => checkNicknameOrThrowError(invalidNickname)).toThrow(
        'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
      )
    })
  })

  describe('createDefaultUserInfo', () => {
    it('should create a default user with a valid nickname', () => {
      const nickname = 'user_123'
      const user = createDefaultUserInfo(nickname)
      expect(user.nickname.value).toBe('user_123')
      expect(user.bio).toBeNull()
    })
  })

  describe('createUserInfo', () => {
    it('should create a user with a valid nickname and bio', () => {
      const nickname = 'user_123'
      const bio = 'This is a bio'
      const user = createUserInfo(nickname, bio)
      expect(user.nickname.value).toBe('user_123')
      expect(user.bio).toBe('This is a bio')
    })
  })

  describe('createDefaultUser', () => {
    it('should create a default user manager with a valid nickname', () => {
      const nickname = 'user_123'
      const userManager = createDefaultUser(nickname)
      expect(userManager.userInfo.nickname.value).toBe('user_123')
      expect(userManager.level.grade.value).toBe(1)
      expect(userManager.level.title).toBe('Novice')
      expect(userManager.userInfo.bio).toBeNull()
      expect(userManager.trophies).toBeNull()
      expect(userManager.profilePicture).toBeNull()
      expect(userManager.cv).toBeNull()
      expect(userManager.languages).toBeNull()
    })
  })

  describe('createAdvancedUser', () => {
    it('should create an advanced user manager with all details', () => {
      const nickname = 'user_123'
      const bio = 'Advanced bio'
      const profilePicture = { url: 'https://example.com/example.png', alt: null }
      const languages: Iterable<Language> = [{ name: 'Java' }, { name: 'Kotlin' }]
      const cv = { url: 'https://example.com/example.pdf' }
      const trophies: Iterable<Trophy> = [
        createTrophy(
          'First Win',
          'Won your first game',
          'https://example.com/trophy.png',
          100
        ),
      ]
      const level = createDefaultLevel()

      const userManager = createAdvancedUser(
        nickname,
        bio,
        profilePicture,
        languages,
        cv,
        trophies,
        level
      )

      expect(userManager.userInfo.nickname.value).toBe('user_123')
      expect(userManager.userInfo.bio).toBe('Advanced bio')
      expect(userManager.profilePicture?.url).toBe('https://example.com/example.png')
      expect(Array.from(userManager.languages!).length).toBe(2)
      expect(userManager.cv?.url).toBe('https://example.com/example.pdf')
      expect(Array.from(userManager.trophies!).length).toBe(1)
      expect(userManager.level.grade.value).toBe(FIRST_LEVEL_GRADE)
    })

    it('should throw an error for an invalid profile picture url', () => {
      expect(() =>
        createAdvancedUser(
          'user',
          'bio',
          { url: '//example.com', alt: null },
          [],
          { url: 'https://example.com' },
          [],
          createDefaultLevel()
        )
      ).toThrow('Invalid URL format')
    })

    it('should throw an error for an invalid cv url', () => {
      expect(() =>
        createAdvancedUser(
          'user',
          'bio',
          { url: 'https://example.com', alt: null },
          [],
          { url: '//example.com' },
          [],
          createDefaultLevel()
        )
      ).toThrow('Invalid URL format')
    })
  })
})
