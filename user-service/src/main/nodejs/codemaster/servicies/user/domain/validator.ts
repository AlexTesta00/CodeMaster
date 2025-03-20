import { UserId } from './user'

const isValidNickname = (nickname: string): boolean => {
  const regex = /^[a-zA-Z0-9_]{3,10}$/
  return regex.test(nickname)
}

const isValidUrl = (url: string): boolean => {
  const regex = /^(http|https):\/\/[^ "]+$/
  return regex.test(url)
}

export const checkNicknameOrThrowError = (nickname: UserId): void => {
  if (!isValidNickname(nickname.value)) {
    throw new Error(
      'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
    )
  }
}

export const checkUrlOrThrowError = (url: string): void => {
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL format')
  }
}
