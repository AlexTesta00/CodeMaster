import {
  createTrophy,
  createTrophyWithDefaultImage,
} from '../../main/nodejs/codemaster/servicies/user/domain/trophy-factory'
import { isLeft, isRight } from 'fp-ts/Either'

describe('Trophy Functions', () => {
  describe('createTrophy', () => {
    it('should create a Trophy with the provided values', () => {
      const title = 'First Win'
      const description = 'Won your first game'
      const url = 'https://example.com/trophy.png'
      const xp = 100

      const trophy = createTrophy(title, description, url, xp)
      const result = isRight(trophy) ? trophy.right : null

      expect(result!.title.value).toBe(title)
      expect(result!.description).toBe(description)
      expect(result!.url).toBe(url)
      expect(result!.xp).toBe(xp)
    })

    it('should throw an error if the title is empty', () => {
      const title = ''
      const description = 'Won your first game'
      const url = 'https://example.com/trophy.png'
      const xp = 100

      const trophy = createTrophy(title, description, url, xp)
      const result = isLeft(trophy) ? trophy.left : null

      expect(isLeft(trophy!)).toBeTruthy()
      expect(result?.message).toEqual('Title cannot be empty')
    })

    it('should throw an error if the XP is negative', () => {
      const title = 'First Win'
      const description = 'Won your first game'
      const url = 'https://example.com/trophy.png'
      const xp = -10

      const trophy = createTrophy(title, description, url, xp)
      const result = isLeft(trophy) ? trophy.left : null

      expect(isLeft(trophy!)).toBeTruthy()
      expect(result?.message).toEqual('XP cannot be negative')
    })

    it('should throw an error if the URL is incorrect', () => {
      const title = 'First Win'
      const description = 'Won your first game'
      const url = 'htt://example'
      const xp = 10

      const trophy = createTrophy(title, description, url, xp)
      const result = isLeft(trophy) ? trophy.left : null

      expect(isLeft(trophy!)).toBeTruthy()
      expect(result?.message).toEqual('Invalid URL format')
    })
  })

  describe('createTrophyWithDefaultImage', () => {
    it('should create a Trophy with the default image URL', () => {
      const title = 'First Win'
      const description = 'Won your first game'
      const xp = 100

      const trophy = createTrophyWithDefaultImage(title, description, xp)
      const result = isRight(trophy) ? trophy.right : null

      expect(result!.title.value).toBe(title)
      expect(result!.description).toBe(description)
      expect(result!.url).toBe('https://www.svgrepo.com/show/530497/trophy.svg')
      expect(result!.xp).toBe(xp)
    })

    it('should throw an error if the title is empty', () => {
      const title = ''
      const description = 'Won your first game'
      const xp = 100

      const trophy = createTrophyWithDefaultImage(title, description, xp)
      const result = isLeft(trophy) ? trophy.left : null

      expect(isLeft(trophy!)).toBeTruthy()
      expect(result?.message).toEqual('Title cannot be empty')
    })

    it('should throw an error if the XP is negative', () => {
      const title = 'First Win'
      const description = 'Won your first game'
      const xp = -10

      const trophy = createTrophyWithDefaultImage(title, description, xp)
      const result = isLeft(trophy) ? trophy.left : null

      expect(isLeft(trophy!)).toBeTruthy()
      expect(result?.message).toEqual('XP cannot be negative')
    })
  })
})
