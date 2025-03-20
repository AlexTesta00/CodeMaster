import { Level, LevelId } from './level'

export const createLevel = (grade: number, title: string, xp: number): Level => {
  if (grade < 1) throw new Error('Grade must be greater than 0')
  if (title === '') throw new Error('Title must not be empty')
  if (xp < 1) throw new Error('XP must be greater than to 0')
  return new Level(new LevelId(grade), title, xp)
}

export const createDefaultLevel = (): Level => {
  return createLevel(1, 'Novice', 1)
}
