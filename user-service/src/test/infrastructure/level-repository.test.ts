import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { LevelModel } from '../../main/nodejs/codemaster/servicies/user/infrastructure/schema'
import {
  createDefaultLevel,
  createLevel,
} from '../../main/nodejs/codemaster/servicies/user/domain/level-factory'
import {
  deleteLevel,
  findLevel,
  getAllLevels,
  saveLevel,
} from '../../main/nodejs/codemaster/servicies/user/infrastructure/level-repository'
import { isLeft, isRight, left, right } from 'fp-ts/Either'
import {
  LevelNotFound,
  UnknownError,
} from '../../main/nodejs/codemaster/servicies/user/infrastructure/repository-error'
import { toLevelModel } from '../../main/nodejs/codemaster/servicies/user/infrastructure/conversion'

describe('Level Repository', () => {
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
    await LevelModel.deleteMany({})
  })

  describe('saveLevel', () => {
    it('should save a level successfully', async () => {
      const level = createLevel(5, 'Intermediate Level', 1000)
      const rightLevel = isRight(level) ? level.right : null
      await saveLevel(rightLevel!)
      const savedLevel = await LevelModel.findOne({ grade: 5 }).exec()
      expect(savedLevel).toBeDefined()
      expect(savedLevel?.grade).toBe(5)
      expect(savedLevel?.title).toBe('Intermediate Level')
      expect(savedLevel?.xp).toBe(1000)
    })

    it('should return UnknownError when saving fails', async () => {
      jest.spyOn(LevelModel.prototype, 'save').mockRejectedValueOnce(new UnknownError())
      const level = createLevel(3, 'Test Level', 500)
      const rightLevel = isRight(level) ? level.right : null
      const result = await saveLevel(rightLevel!)
      expect(result).toEqual(left(new UnknownError()))
    })
  })

  describe('findLevel', () => {
    it('should find an existing level by grade', async () => {
      const level = createLevel(7, 'Advanced Level', 2000)
      expect(isRight(level)).toBeTruthy()

      const rightLevel = isRight(level) ? level.right : null
      await saveLevel(rightLevel!)

      const result = await findLevel({ value: 7 })
      expect(isRight(result)).toBeTruthy()

      const rightResult = isRight(result) ? result.right : null
      expect(rightResult!).toEqual(rightLevel)
    })

    it('should return LevelNotFound for non-existent level', async () => {
      const result = await findLevel({ value: 99 })
      expect(result).toEqual(left(new LevelNotFound('Level not found')))
    })

    it('should return UnknownError when find operation fails', async () => {
      jest.spyOn(LevelModel, 'findOne').mockImplementationOnce(() => {
        throw new UnknownError()
      })

      const result = await findLevel({ value: 1 })

      expect(result).toEqual(left(new UnknownError()))
    })
  })

  describe('deleteLevel', () => {
    it('should delete an existing level', async () => {
      const level = createLevel(4, 'Level to delete', 750)
      const rightLevel = isRight(level) ? level.right : null
      await saveLevel(rightLevel!)
      const result = await deleteLevel({ value: 4 })
      expect(result).toEqual(right(undefined))
      const deletedLevel = await LevelModel.findOne({ grade: 4 }).exec()
      expect(deletedLevel).toBeNull()
    })

    it('should return LevelNotFound when trying to delete non-existent level', async () => {
      const result = await deleteLevel({ value: 100 })
      expect(result).toEqual(left(new LevelNotFound('Level not found')))
    })

    it('should return UnknownError when delete operation fails', async () => {
      jest.spyOn(LevelModel, 'findOneAndDelete').mockImplementationOnce(() => {
        throw new UnknownError()
      })
      const result = await deleteLevel({ value: 2 })
      expect(result).toEqual(left(new UnknownError()))
    })
  })

  describe('getAllLevels', () => {
    it('should correctly return all levels', async () => {
      const firstLevel = createDefaultLevel()
      const secondLevel = createLevel(2, 'Expert', 20)
      const levels = [firstLevel, secondLevel]
        .filter(isRight)
        .map((either) => either.right)
      await saveLevel(levels[0])
      await saveLevel(levels[1])
      const result = await getAllLevels()
      expect(isRight(result)).toBeTruthy()

      const rightResult = isRight(result) ? Array.from(result.right) : null
      expect(rightResult!).toEqual(levels)
    })

    it('should correctly return empty iterable of levels', async () => {
      const result = await getAllLevels()
      expect(isLeft(result)).toBeTruthy()
    })
  })

  describe('toLevelModel', () => {
    it('should correctly convert Level to LevelModel', () => {
      const level = createLevel(6, 'Conversion Test', 1500)
      const rightLevel = isRight(level) ? level.right : null
      const model = toLevelModel(rightLevel!)
      expect(model.grade).toBe(6)
      expect(model.title).toBe('Conversion Test')
      expect(model.xp).toBe(1500)
    })
  })
})
