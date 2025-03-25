import { Level, LevelId } from '../domain/level'
import { LevelModel } from './schema'
import { Either, left, right } from 'fp-ts/Either'
import { LevelNotFound, UnknownError } from './repository-error'
import { createLevel } from '../domain/level-factory'

export const toLevelModel = (level: Level) => {
  return new LevelModel({
    grade: level.grade.value,
    title: level.title,
    xp: level.xpLevel,
  })
}

export const saveLevel = async (level: Level): Promise<Either<Error, Level>> => {
  try {
    await toLevelModel(level).save()
    return right(level)
  } catch (error) {
    void error
    return left(error instanceof Error ? error : new UnknownError())
  }
}

export const findLevel = async (levelId: LevelId): Promise<Either<Error, Level>> => {
  try {
    const levelDocument = await LevelModel.findOne({ grade: levelId.value }).exec()
    if (!levelDocument) return left(new LevelNotFound('Level not found'))
    const levelFounded = createLevel(
      levelDocument.grade,
      levelDocument.title,
      levelDocument.xp
    )
    return right(levelFounded)
  } catch (error) {
    void error
    return left(error instanceof Error ? error : new UnknownError())
  }
}

export const deleteLevel = async (levelId: LevelId): Promise<Either<Error, void>> => {
  try {
    const levelDocument = await LevelModel.findOneAndDelete({
      grade: levelId.value,
    }).exec()
    if (!levelDocument) return left(new LevelNotFound('Level not found'))
    return right(undefined)
  } catch (error) {
    void error
    return left(error instanceof Error ? error : new UnknownError())
  }
}
