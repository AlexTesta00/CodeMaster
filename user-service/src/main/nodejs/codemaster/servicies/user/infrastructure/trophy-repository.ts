import { Trophy, TrophyId } from '../domain/trophy'
import { chain, Either, left, right } from 'fp-ts/Either'
import { TrophyNotFound, UnknownError } from './repository-error'
import { TrophyModel } from './schema'
import { createTrophy } from '../domain/trophy-factory'
import { toTrophyModel } from './conversion'
import { tryCatch } from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

export const saveTrophy = async (trophy: Trophy): Promise<Either<Error, Trophy>> =>
  tryCatch(
    async () => {
      await toTrophyModel(trophy).save()
      return trophy
    },
    (error) => (error instanceof Error ? error : new UnknownError())
  )()

export const findTrophy = async (trophyId: TrophyId): Promise<Either<Error, Trophy>> =>
  pipe(
    await tryCatch(
      async () => {
        const trophyDocument = await TrophyModel.findOne({
          title: trophyId.value,
        }).exec()
        return trophyDocument
          ? right(trophyDocument)
          : left(new TrophyNotFound('Trophy not found'))
      },
      (error) => (error instanceof Error ? error : new UnknownError())
    )(),
    chain((either) => either),
    chain((trophyDoc) =>
      createTrophy(trophyDoc.title, trophyDoc.description, trophyDoc.url, trophyDoc.xp)
    )
  )

export const deleteTrophy = async (trophyId: TrophyId): Promise<Either<Error, void>> =>
  pipe(
    await tryCatch(
      async () => {
        const trophyDocument = await TrophyModel.findOneAndDelete({
          title: trophyId.value,
        }).exec()
        return trophyDocument
          ? right(undefined)
          : left(new TrophyNotFound('Trophy not found'))
      },
      (error) => (error instanceof Error ? error : new UnknownError())
    )(),
    chain((either) => either)
  )
