import { Level, LevelId } from '../domain/level'
import { LevelModel } from './schema'
import { chain, Either, isRight, left, map, right } from 'fp-ts/Either'
import { LevelNotFound, UnknownError } from './repository-error'
import { createLevel } from '../domain/level-factory'
import { toLevel, toLevelModel } from './conversion'
import { tryCatch } from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

export const saveLevel = async (level: Level): Promise<Either<Error, Level>> =>
  tryCatch(
    async () => {
      await toLevelModel(level).save()
      return level
    },
    (error) => (error instanceof Error ? error : new UnknownError())
  )()

export const findLevel = async (levelId: LevelId): Promise<Either<Error, Level>> =>
  pipe(
    await tryCatch(
      async () => {
        const levelDocument = await LevelModel.findOne({
          grade: levelId.value,
        }).exec()
        return levelDocument
          ? right(levelDocument)
          : left(new LevelNotFound('Level not found'))
      },
      (error) => (error instanceof Error ? error : new UnknownError())
    )(),
    chain((either) => either),
    chain((levelDoc) => createLevel(levelDoc.grade, levelDoc.title, levelDoc.xp))
  )

export const deleteLevel = async (levelId: LevelId): Promise<Either<Error, void>> =>
  pipe(
    await tryCatch(
      async () => {
        const levelDocument = await LevelModel.findOneAndDelete({
          grade: levelId.value,
        }).exec()
        return levelDocument
          ? right(undefined)
          : left(new LevelNotFound('Level not found'))
      },
      (error) => (error instanceof Error ? error : new UnknownError())
    )(),
    chain((either) => either)
  )

export const getAllLevels = async (): Promise<Either<Error, Iterable<Level>>> =>
  pipe(
    await tryCatch(
      async () => {
        const levels = await LevelModel.find().exec()
        return levels.length > 0
          ? right(levels)
          : left(new LevelNotFound('Levels not found'))
      },
      (error) => (error instanceof Error ? error : new UnknownError())
    )(),
    chain((either) => either),
    map((levels) =>
      levels
        .map(toLevel)
        .filter(isRight)
        .map((level) => level.right)
    )
  )
