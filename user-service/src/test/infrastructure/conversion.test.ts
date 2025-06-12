import {
  LevelDocument,
  toLevel,
  toTrophy,
  toUserManager,
  toUserManagerModel,
  TrophyDocument,
} from '../../main/nodejs/codemaster/servicies/user/infrastructure/conversion'
import { Either, isRight } from 'fp-ts/Either'
import { isSome, none } from 'fp-ts/Option'
import { UserManager } from '../../main/nodejs/codemaster/servicies/user/domain/user-manager'
import {
  createAdvancedUser,
  createDefaultUser,
} from '../../main/nodejs/codemaster/servicies/user/domain/user-factory'
import { createTrophy } from '../../main/nodejs/codemaster/servicies/user/domain/trophy-factory'
import {
  createDefaultLevel,
  DEFAULT_IMAGE_URL,
} from '../../main/nodejs/codemaster/servicies/user/domain/level-factory'

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

describe('Test conversion', () => {
  it('should correctly convert UserManager to UserManagerModel and vice versa', () => {
    const userManagerModel = toUserManagerModel(newUserManager!)
    const convertedUserManager = toUserManager(userManagerModel)
    const resultUserManager = isRight(convertedUserManager)
      ? convertedUserManager.right
      : null
    const convertedLanguages = isSome(resultUserManager!.languages)
      ? resultUserManager!.languages.value
      : []
    const convertedTrophies = isSome(resultUserManager!.trophies)
      ? resultUserManager!.trophies.value
      : []
    const convertedCV = isSome(resultUserManager!.cv)
      ? resultUserManager!.cv.value
      : { url: '' }
    expect(userManagerModel.userInfo.nickname).toEqual(nickname)
    expect(userManagerModel.userInfo.bio).toEqual(bio)
    expect(userManagerModel.profilePicture.url).toEqual('https://example.com')
    expect(userManagerModel.profilePicture.alt).toBeNull()
    expect(userManagerModel.languages.length).toEqual(3)
    expect(userManagerModel.cv.url).toEqual('https://example.com')
    expect(userManagerModel.trophies.length).toEqual(1)
    expect(userManagerModel.level.grade).toEqual(rightLevel!.grade.value)
    expect(userManagerModel.level.title).toEqual(rightLevel!.title)
    expect(userManagerModel.level.xp).toEqual(rightLevel!.xpLevel)
    expect(resultUserManager!.userInfo.nickname).toEqual(
      newUserManager!.userInfo.nickname
    )
    expect(resultUserManager!.userInfo.bio).toEqual(newUserManager!.userInfo.bio)
    expect(resultUserManager!.profilePicture).toEqual(newUserManager!.profilePicture)
    expect(Array.from(convertedLanguages).map((language) => language.name)).toEqual(
      languages.map((language) => language.name)
    )
    expect(convertedCV.url).toEqual(cv.url)
    expect(convertedTrophies).toEqual(trophies)
    expect(resultUserManager!.level).toEqual(rightLevel)
  })

  it('should correctly convert default UserManager into UserManagerModel', () => {
    const defaultUser = createDefaultUser('default')
    const rightDefaultUser = isRight(defaultUser) ? defaultUser.right : null
    const converted = toUserManagerModel(rightDefaultUser!)
    expect(converted.userInfo.nickname).toEqual('default')
    expect(converted.userInfo.bio).toBe('')
    expect(converted.profilePicture.url).toBe('')
    expect(converted.profilePicture.alt).toBeNull()
    expect(Array.from(converted.languages).length).toBe(0)
    expect(converted.cv.url).toBe('')
    expect(Array.from(converted.trophies).length).toBe(0)
  })

  it('should correctly convert default UserManagerModel into UserManager', () => {
    const defaultUser = createDefaultUser('default')
    const rightDefaultUser = isRight(defaultUser) ? defaultUser.right : null
    const converted = toUserManagerModel(rightDefaultUser!)
    const userManager = toUserManager(converted)
    const result = isRight(userManager) ? userManager.right : null
    expect(result?.userInfo.nickname.value).toEqual('default')
    expect(result?.userInfo.bio).toBe(none)
    expect(result?.languages).toBe(none)
    expect(result?.profilePicture).toBe(none)
    expect(result?.cv).toBe(none)
    expect(result?.trophies).toBe(none)
  })

  it('should successfully convert a valid TrophyDocument to Trophy', () => {
    const validTrophyDoc: TrophyDocument = {
      title: 'Test Trophy',
      description: 'Test Description',
      url: 'https://example.com/trophy',
      xp: 100,
    }

    const result = toTrophy(validTrophyDoc)

    expect(result._tag).toBe('Right')
    if (result._tag === 'Right') {
      expect(result.right.title.value).toBe(validTrophyDoc.title)
      expect(result.right.description).toBe(validTrophyDoc.description)
      expect(result.right.url).toBe(validTrophyDoc.url)
      expect(result.right.xp).toBe(validTrophyDoc.xp)
    }
  })

  it('should successfully convert a valid LevelDocument to Level', () => {
    const validLevelDoc: LevelDocument = {
      grade: 3,
      title: 'Intermediate',
      xp: 1500,
      url: DEFAULT_IMAGE_URL,
    }

    const result = toLevel(validLevelDoc)

    expect(result._tag).toBe('Right')
    if (result._tag === 'Right') {
      expect(result.right.grade.value).toBe(validLevelDoc.grade)
      expect(result.right.title).toBe(validLevelDoc.title)
      expect(result.right.xpLevel).toBe(validLevelDoc.xp)
      expect(result.right.imageUrl).toBe(DEFAULT_IMAGE_URL)
    }
  })
})
