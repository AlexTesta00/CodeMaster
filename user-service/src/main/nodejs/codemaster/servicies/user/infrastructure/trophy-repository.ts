import { Trophy, TrophyId } from '../domain/trophy'
import { Either, left, right } from 'fp-ts/Either'
import { TrophyNotFound, UnknownError } from './repository-error'
import { TrophyModel } from './schema'
import { createTrophy } from '../domain/trophy-factory'

export const toTrophyModel = (trophy: Trophy) => {
  return new TrophyModel({
    title: trophy.title.value,
    description: trophy.description,
    url: trophy.url,
    xp: trophy.xp,
  })
}

export const saveTrophy = async (trophy: Trophy): Promise<Either<Error, Trophy>> => {
  try {
    await toTrophyModel(trophy).save()
    return right(trophy)
  } catch (error) {
    void error
    return left(error instanceof Error ? error : new UnknownError())
  }
}

export const findTrophy = async (trophyId: TrophyId): Promise<Either<Error, Trophy>> => {
  try {
    const trophyDocument = await TrophyModel.findOne({ title: trophyId.value }).exec()
    if (!trophyDocument) return left(new TrophyNotFound('Trophy not found'))
    const trophy: Trophy = createTrophy(
      trophyDocument.title,
      trophyDocument.description,
      trophyDocument.url,
      trophyDocument.xp
    )
    return right(trophy)
  } catch (error) {
    return left(error instanceof Error ? error : new UnknownError())
  }
}

export const deleteTrophy = async (trophyId: TrophyId): Promise<Either<Error, void>> => {
  try {
    const trophyDocument = await TrophyModel.findOneAndDelete({
      title: trophyId.value,
    }).exec()
    if (!trophyDocument) return left(new TrophyNotFound('Trophy not found'))
    return right(undefined)
  } catch (error) {
    return left(error instanceof Error ? error : new UnknownError())
  }
}
