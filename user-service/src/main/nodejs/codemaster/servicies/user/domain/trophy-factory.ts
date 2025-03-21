import { Trophy } from './trophy'
import { checkUrlOrThrowError } from './validator'

export const createTrophy = (
  title: string,
  description: string,
  url: string,
  xp: number
): Trophy => {
  if (!title) throw new Error('Title cannot be empty')
  if (xp < 0) throw new Error('XP cannot be negative')
  checkUrlOrThrowError(url)
  return {
    title: { value: title },
    description: description,
    url: url,
    xp: xp,
  }
}

export const createTrophyWithDefaultImage = (
  title: string,
  description: string,
  xp: number
): Trophy => {
  const defaultImageUrl = 'https://www.svgrepo.com/show/530497/trophy.svg'
  return createTrophy(title, description, defaultImageUrl, xp)
}
