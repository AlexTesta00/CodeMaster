import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { LevelModel } from '../../main/nodejs/codemaster/servicies/user/infrastructure/schema'
import { createLevel } from '../../main/nodejs/codemaster/servicies/user/domain/level-factory'
import {
  deleteLevel,
  findLevel,
  saveLevel,
  toLevelModel,
} from '../../main/nodejs/codemaster/servicies/user/infrastructure/level-repository'
import { left, right } from 'fp-ts/Either'
import {
  LevelNotFound,
  UnknownError,
} from '../../main/nodejs/codemaster/servicies/user/infrastructure/repository-error'

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

      await saveLevel(level)
      const savedLevel = await LevelModel.findOne({ grade: 5 }).exec()
      expect(savedLevel).toBeDefined()
      expect(savedLevel?.grade).toBe(5)
      expect(savedLevel?.title).toBe('Intermediate Level')
      expect(savedLevel?.xp).toBe(1000)
    })

    it('should return UnknownError when saving fails', async () => {
      jest.spyOn(LevelModel.prototype, 'save').mockRejectedValueOnce(new UnknownError())

      const level = createLevel(3, 'Test Level', 500)

      const result = await saveLevel(level)
      expect(result).toEqual(left(new UnknownError()))
    })
  })

  describe('findLevel', () => {
    it('should find an existing level by grade', async () => {
      const level = createLevel(7, 'Advanced Level', 2000)
      await saveLevel(level)
      const result = await findLevel({ value: 7 })
      expect(result).toEqual(right(level))
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
      await saveLevel(level)

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

  describe('toLevelModel', () => {
    it('should correctly convert Level to LevelModel', () => {
      const level = createLevel(6, 'Conversion Test', 1500)

      const model = toLevelModel(level)
      expect(model.grade).toBe(6)
      expect(model.title).toBe('Conversion Test')
      expect(model.xp).toBe(1500)
    })
  })
})
