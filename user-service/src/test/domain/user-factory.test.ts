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
import { fold, isSome, none } from 'fp-ts/Option'
import { ProfilePicture } from '../../main/nodejs/codemaster/servicies/user/domain/profile-picture'
import { CV } from '../../main/nodejs/codemaster/servicies/user/domain/cv'

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
      expect(isSome(user.bio)).not.toBeTruthy()
    })
  })

  describe('createUserInfo', () => {
    it('should create a user with a valid nickname and bio', () => {
      const nickname = 'user_123'
      const bio = 'This is a bio'
      const user = createUserInfo(nickname, bio)
      expect(user.nickname.value).toBe('user_123')

      const userBio = fold(
        () => '',
        (bio: string): string => bio
      )(user.bio)

      expect(userBio).toBe('This is a bio')
    })
  })

  describe('createDefaultUser', () => {
    it('should create a default user manager with a valid nickname', () => {
      const nickname = 'user_123'
      const userManager = createDefaultUser(nickname)
      expect(userManager.userInfo.nickname.value).toBe('user_123')
      expect(userManager.level.grade.value).toBe(1)
      expect(userManager.level.title).toBe('Novice')
      expect(isSome(userManager.userInfo.bio)).not.toBeTruthy()
      expect(isSome(userManager.trophies)).not.toBeTruthy()
      expect(isSome(userManager.profilePicture)).not.toBeTruthy()
      expect(isSome(userManager.cv)).not.toBeTruthy()
      expect(isSome(userManager.languages)).not.toBeTruthy()
    })
  })

  describe('createAdvancedUser', () => {
    it('should create an advanced user manager with all details', () => {
      const nickname = 'user_123'
      const bio = 'Advanced bio'
      const profilePicture = { url: 'https://example.com/example.png', alt: none }
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

      const retriveUserBio = fold(
        () => '',
        (bio: string): string => bio
      )(userManager.userInfo.bio)

      const retriveProfilePicture = fold(
        () => '',
        (profilePicture: ProfilePicture): string => profilePicture.url
      )(userManager.profilePicture)

      const retriveTrophies = fold(
        () => [],
        (trophies: Iterable<Trophy>): Trophy[] => Array.from(trophies)
      )(userManager.trophies)

      const retriveCVInfo = fold(
        () => '',
        (cv: CV): string => cv.url
      )(userManager.cv)

      const retriveLanguages = fold(
        () => [],
        (languages: Iterable<Language>): Language[] => Array.from(languages)
      )(userManager.languages)

      expect(userManager.userInfo.nickname.value).toBe('user_123')
      expect(retriveUserBio).toBe('Advanced bio')
      expect(isSome(userManager.profilePicture)).toBeTruthy()
      expect(retriveProfilePicture).toBe('https://example.com/example.png')
      expect(isSome(userManager.languages)).toBeTruthy()
      expect(retriveLanguages.length).toBe(2)
      expect(isSome(userManager.cv)).toBeTruthy()
      expect(retriveCVInfo).toBe('https://example.com/example.pdf')
      expect(isSome(userManager.trophies)).toBeTruthy()
      expect(retriveTrophies.length).toBe(1)
      expect(userManager.level.grade.value).toBe(FIRST_LEVEL_GRADE)
    })

    it('should throw an error for an invalid profile picture url', () => {
      expect(() =>
        createAdvancedUser(
          'user',
          'bio',
          { url: '//example.com', alt: none },
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
          { url: 'https://example.com', alt: none },
          [],
          { url: '//example.com' },
          [],
          createDefaultLevel()
        )
      ).toThrow('Invalid URL format')
    })
  })
})
