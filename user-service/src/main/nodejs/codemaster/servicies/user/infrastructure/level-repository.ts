import { Level, LevelId } from '../domain/level'
import { LevelModel } from './schema'
import { Either } from 'fp-ts/Either'
import { LevelNotFound, UnknownError } from './repository-error'
import { createLevel } from '../domain/level-factory'
import { toLevelModel } from './conversion'
import { tryCatch } from 'fp-ts/TaskEither'

export const saveLevel = async (level: Level): Promise<Either<Error, Level>> =>
  tryCatch(
    async () => {
      await toLevelModel(level).save()
      return level
    },
    (error) => (error instanceof Error ? error : new UnknownError())
  )()

export const findLevel = async (levelId: LevelId): Promise<Either<Error, Level>> =>
  tryCatch(
    async () => {
      const levelDocument = await LevelModel.findOne({ grade: levelId.value }).exec()
      if (!levelDocument) throw new LevelNotFound('Level not found')
      return createLevel(levelDocument.grade, levelDocument.title, levelDocument.xp)
    },
    (error) => (error instanceof Error ? error : new UnknownError())
  )()

export const deleteLevel = async (levelId: LevelId): Promise<Either<Error, void>> =>
  tryCatch(
    async () => {
      const levelDocument = await LevelModel.findOneAndDelete({
        grade: levelId.value,
      }).exec()
      if (!levelDocument) throw new LevelNotFound('Level not found')
    },
    (error) => (error instanceof Error ? error : new UnknownError())
  )()
