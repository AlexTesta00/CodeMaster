import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { TrophyModel } from '../../main/nodejs/codemaster/servicies/user/infrastructure/schema'
import { createTrophy } from '../../main/nodejs/codemaster/servicies/user/domain/trophy-factory'
import {
  deleteTrophy,
  findTrophy,
  getAllTrophies,
  saveTrophy,
} from '../../main/nodejs/codemaster/servicies/user/infrastructure/trophy-repository'
import { isRight, left, right } from 'fp-ts/Either'
import {
  TrophyNotFound,
  UnknownError,
} from '../../main/nodejs/codemaster/servicies/user/infrastructure/repository-error'
import { toTrophyModel } from '../../main/nodejs/codemaster/servicies/user/infrastructure/conversion'

describe('Test Trophy Repository', () => {
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    await TrophyModel.deleteMany({})
  })

  describe('saveTrophy', () => {
    it('should save a trophy successfully', async () => {
      const trophy = createTrophy(
        'test-trophy',
        'Test Description',
        'http://test.com',
        100
      )
      const result = isRight(trophy) ? trophy.right : null

      await saveTrophy(result!)
      const savedTrophy = await TrophyModel.findOne({ title: 'test-trophy' }).exec()
      expect(savedTrophy).toBeDefined()
      expect(savedTrophy?.title).toBe('test-trophy')
      expect(savedTrophy?.description).toBe('Test Description')
      expect(savedTrophy?.url).toBe('http://test.com')
      expect(savedTrophy?.xp).toBe(100)
    })

    it('should return UnknownError when saving fails', async () => {
      jest.spyOn(TrophyModel.prototype, 'save').mockRejectedValueOnce(new UnknownError())
      const trophy = createTrophy(
        'test-trophy',
        'Test Description',
        'http://test.com',
        100
      )
      const rightTrophy = isRight(trophy) ? trophy.right : null
      const result = await saveTrophy(rightTrophy!)
      expect(result).toEqual(left(new UnknownError()))
    })
  })

  describe('findTrophy', () => {
    it('should find an existing trophy', async () => {
      const trophy = createTrophy('find-me', 'Find me please', 'http://find.me', 50)
      expect(isRight(trophy)).toBeTruthy()

      const rightTrophy = isRight(trophy) ? trophy.right : null
      await saveTrophy(rightTrophy!)

      const result = await findTrophy({ value: 'find-me' })
      expect(isRight(result)).toBeTruthy()

      const rightResult = isRight(result) ? result.right : null
      expect(rightResult!).toEqual(rightTrophy)
    })

    it('should return TrophyNotFound for non-existent trophy', async () => {
      const result = await findTrophy({ value: 'not-exist' })
      expect(result).toEqual(left(new TrophyNotFound('Trophy not found')))
    })

    it('should return UnknownError when find operation fails', async () => {
      jest.spyOn(TrophyModel, 'findOne').mockImplementationOnce(() => {
        throw new UnknownError()
      })

      const result = await findTrophy({ value: 'any-id' })

      expect(result).toEqual(left(new UnknownError()))
    })
  })

  describe('deleteTrophy', () => {
    it('should delete an existing trophy', async () => {
      const trophy = createTrophy('delete-me', 'Delete me please', 'http://delete.me', 75)
      const rightTrophy = isRight(trophy) ? trophy.right : null
      await saveTrophy(rightTrophy!)

      const result = await deleteTrophy({ value: 'delete-me' })

      expect(result).toEqual(right(undefined))

      const deletedTrophy = await TrophyModel.findOne({ title: 'delete-me' }).exec()
      expect(deletedTrophy).toBeNull()
    })

    it('should return TrophyNotFound when trying to delete non-existent trophy', async () => {
      const result = await deleteTrophy({ value: 'not-exist' })
      expect(result).toEqual(left(new TrophyNotFound('Trophy not found')))
    })

    it('should return UnknownError when delete operation fails', async () => {
      jest.spyOn(TrophyModel, 'findOneAndDelete').mockImplementationOnce(() => {
        throw new UnknownError()
      })

      const result = await deleteTrophy({ value: 'any-id' })

      expect(result).toEqual(left(new UnknownError()))
    })
  })

  describe('getAllTrophies', () => {
    it('should correctly return all trophies', async () => {
      const firstTrophy = createTrophy('First', 'First', 'https://first.com', 10)
      const secondTrophy = createTrophy('Second', 'Second', 'https://second.com', 20)
      const trophies = [firstTrophy, secondTrophy]
        .filter(isRight)
        .map((either) => either.right)
      await saveTrophy(trophies[0])
      await saveTrophy(trophies[1])
      const result = await getAllTrophies()
      expect(isRight(result)).toBeTruthy()

      const rightResult = isRight(result) ? Array.from(result.right) : null
      expect(rightResult![0]).toEqual(firstTrophy)
      expect(rightResult![1]).toEqual(secondTrophy)
    })

    it('should correctly return empty iterable of trophies', async () => {
      const result = await getAllTrophies()
      expect(isRight(result)).toBeTruthy()

      const rightResult = isRight(result) ? Array.from(result.right) : null
      expect(rightResult!.length).toEqual(0)
    })
  })

  describe('toTrophyModel', () => {
    it('should correctly convert Trophy to TrophyModel', () => {
      const trophy = createTrophy('model-test', 'Model Test', 'http://model.test', 200)
      const rightTrophy = isRight(trophy) ? trophy.right : null
      const model = toTrophyModel(rightTrophy!)

      expect(model.title).toBe('model-test')
      expect(model.description).toBe('Model Test')
      expect(model.url).toBe('http://model.test')
      expect(model.xp).toBe(200)
    })
  })
})
