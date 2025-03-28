import { Trophy, TrophyId } from '../domain/trophy'
import { Either } from 'fp-ts/Either'
import { TrophyNotFound, UnknownError } from './repository-error'
import { TrophyModel } from './schema'
import { createTrophy } from '../domain/trophy-factory'
import { toTrophyModel } from './conversion'
import { tryCatch } from 'fp-ts/TaskEither'

export const saveTrophy = async (trophy: Trophy): Promise<Either<Error, Trophy>> =>
  tryCatch(
    async () => {
      await toTrophyModel(trophy).save()
      return trophy
    },
    (error) => (error instanceof Error ? error : new UnknownError())
  )()

export const findTrophy = async (trophyId: TrophyId): Promise<Either<Error, Trophy>> =>
  tryCatch(
    async () => {
      const trophyDocument = await TrophyModel.findOne({ title: trophyId.value }).exec()
      if (!trophyDocument) throw new TrophyNotFound('Trophy not found')
      return createTrophy(
        trophyDocument.title,
        trophyDocument.description,
        trophyDocument.url,
        trophyDocument.xp
      )
    },
    (error) => (error instanceof Error ? error : new UnknownError())
  )()

export const deleteTrophy = async (trophyId: TrophyId): Promise<Either<Error, void>> =>
  tryCatch(
    async () => {
      const trophyDocument = await TrophyModel.findOneAndDelete({
        title: trophyId.value,
      }).exec()
      if (!trophyDocument) throw new TrophyNotFound('Trophy not found')
    },
    (error) => (error instanceof Error ? error : new UnknownError())
  )()
