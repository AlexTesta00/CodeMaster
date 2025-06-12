import { Level } from './level'
import { chain, Either, left, match, right } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export const FIRST_LEVEL_GRADE: number = 1
export const FIRST_LEVEL_TITLE: string = 'Novice'
export const FIRST_LEVEL_XP: number = 1

export const DEFAULT_IMAGE_URL = 'https://cdn-icons-png.flaticon.com/512/1055/1055646.png'

export const createLevel = (
  grade: number,
  title: string,
  xp: number,
  imageUrl: string
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
          imageUrl: imageUrl,
        })
    )
  )

export const createDefaultLevel = (): Either<Error, Level> =>
  createLevel(FIRST_LEVEL_GRADE, FIRST_LEVEL_TITLE, FIRST_LEVEL_XP, DEFAULT_IMAGE_URL)
