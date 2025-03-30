import { Trophy } from './trophy'
import { checkUrl } from './validator'
import { chain, Either, left, match, right } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export const createTrophy = (
  title: string,
  description: string,
  url: string,
  xp: number
): Either<Error, Trophy> =>
  pipe(
    right({}),
    chain(() => (title ? right(title) : left(new Error('Title cannot be empty')))),
    chain((validTitle) =>
      xp >= 0
        ? right({ validTitle, validXp: xp })
        : left(new Error('XP cannot be negative'))
    ),
    chain(({ validTitle, validXp }) =>
      pipe(
        checkUrl(url),
        match(
          (error) => left(error),
          (validUrl) =>
            right({
              title: { value: validTitle },
              description,
              url: validUrl,
              xp: validXp,
            })
        )
      )
    )
  )

export const createTrophyWithDefaultImage = (
  title: string,
  description: string,
  xp: number
): Either<Error, Trophy> =>
  createTrophy(title, description, 'https://www.svgrepo.com/show/530497/trophy.svg', xp)
