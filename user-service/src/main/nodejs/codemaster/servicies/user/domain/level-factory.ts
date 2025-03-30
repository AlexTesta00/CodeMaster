import { Level } from './level'
import { chain, Either, left, match, right } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export const FIRST_LEVEL_GRADE: number = 1
export const FIRST_LEVEL_TITLE: string = 'Novice'
export const FIRST_LEVEL_XP: number = 1

export const createLevel = (
  grade: number,
  title: string,
  xp: number
): Either<Error, Level> =>
  pipe(
    right({}),
    chain(() =>
      grade >= 1 ? right(grade) : left(new Error('Grade must be greater than 0'))
    ),
    chain(() => (title != '' ? right(title) : left(Error('Title cannot be empty')))),
    chain(() => (xp >= 1 ? right(xp) : left(Error('XP must be greater than to 0')))),
    match(
      (error) => left(error),
      () =>
        right({
          grade: { value: grade },
          title: title,
          xpLevel: xp,
        })
    )
  )

export const createDefaultLevel = (): Either<Error, Level> =>
  createLevel(FIRST_LEVEL_GRADE, FIRST_LEVEL_TITLE, FIRST_LEVEL_XP)
