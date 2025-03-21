import { Level } from './level'

export const FIRST_LEVEL_GRADE: number = 1
export const FIRST_LEVEL_TITLE: string = 'Novice'
export const FIRST_LEVEL_XP: number = 1

export const createLevel = (grade: number, title: string, xp: number): Level => {
  if (grade < 1) throw new Error('Grade must be greater than 0')
  if (title === '') throw new Error('Title must not be empty')
  if (xp < 1) throw new Error('XP must be greater than to 0')
  return {
    grade: { value: grade },
    title: title,
    xpLevel: xp,
  }
}

export const createDefaultLevel = (): Level => {
  return createLevel(FIRST_LEVEL_GRADE, FIRST_LEVEL_TITLE, FIRST_LEVEL_XP)
}
