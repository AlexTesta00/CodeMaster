import { UserId } from '../../main/nodejs/codemaster/servicies/user/domain/user'
import {
  createAdvancedUser,
  createDefaultUser,
  createDefaultUserInfo,
  createUserInfo,
} from '../../main/nodejs/codemaster/servicies/user/domain/user-factory'
import { ProfilePicture } from '../../main/nodejs/codemaster/servicies/user/domain/profile-picture'
import { Language } from '../../main/nodejs/codemaster/servicies/user/domain/language'
import { CV } from '../../main/nodejs/codemaster/servicies/user/domain/cv'
import {
  Trophy,
  TrophyId,
} from '../../main/nodejs/codemaster/servicies/user/domain/trophy'
import { Level, LevelId } from '../../main/nodejs/codemaster/servicies/user/domain/level'
import { checkNicknameOrThrowError } from '../../main/nodejs/codemaster/servicies/user/domain/validator'

describe('User Functions', () => {
  describe('checkNicknameOrThrowError', () => {
    it('should not throw an error for a valid nickname', () => {
      const validNickname = new UserId('valid_123')
      expect(() => checkNicknameOrThrowError(validNickname)).not.toThrow()
    })

    it('should throw an error for an invalid nickname', () => {
      const invalidNickname = new UserId('inv@lid')
      expect(() => checkNicknameOrThrowError(invalidNickname)).toThrow(
        'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
      )
    })
  })

  describe('createDefaultUserInfo', () => {
    it('should create a default user with a valid nickname', () => {
      const nickname = new UserId('user_123')
      const user = createDefaultUserInfo(nickname)
      expect(user.nickname.value).toBe('user_123')
      expect(user.bio).toBeNull()
    })
  })

  describe('createUserInfo', () => {
    it('should create a user with a valid nickname and bio', () => {
      const nickname = new UserId('user_123')
      const bio = 'This is a bio'
      const user = createUserInfo(nickname, bio)
      expect(user.nickname.value).toBe('user_123')
      expect(user.bio).toBe('This is a bio')
    })
  })

  describe('createDefaultUser', () => {
    it('should create a default user manager with a valid nickname', () => {
      const nickname = new UserId('user_123')
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
      const nickname = new UserId('user_123')
      const bio = 'Advanced bio'
      const profilePicture = new ProfilePicture('https://example.com/example.png', null)
      const languages: Iterable<Language> = [new Language('Java'), new Language('Kotlin')]
      const cv = new CV('https://example.com/example.pdf')
      const trophies: Iterable<Trophy> = [
        new Trophy(new TrophyId('First Win'), '', '', 560),
      ]
      const level = new Level(new LevelId(2), 'intermediate', 100)

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
      expect(userManager.level.grade.value).toBe(2)
    })
  })
})
