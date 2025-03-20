import {
  createTrophy,
  createTrophyWithDefaultImage,
} from '../../main/nodejs/codemaster/servicies/user/domain/trophy-factory'

describe('Trophy Functions', () => {
  describe('createTrophy', () => {
    it('should create a Trophy with the provided values', () => {
      const title = 'First Win'
      const description = 'Won your first game'
      const url = 'https://example.com/trophy.png'
      const xp = 100

      const trophy = createTrophy(title, description, url, xp)

      expect(trophy.title.value).toBe(title)
      expect(trophy.description).toBe(description)
      expect(trophy.url).toBe(url)
      expect(trophy.xp).toBe(xp)
    })

    it('should throw an error if the title is empty', () => {
      const title = ''
      const description = 'Won your first game'
      const url = 'https://example.com/trophy.png'
      const xp = 100

      expect(() => createTrophy(title, description, url, xp)).toThrow(
        'Title cannot be empty'
      )
    })

    it('should throw an error if the XP is negative', () => {
      const title = 'First Win'
      const description = 'Won your first game'
      const url = 'https://example.com/trophy.png'
      const xp = -10

      expect(() => createTrophy(title, description, url, xp)).toThrow(
        'XP cannot be negative'
      )
    })

    it('should throw an error if the URL is incorrect', () => {
      const title = 'First Win'
      const description = 'Won your first game'
      const url = 'htt://example'
      const xp = 10

      expect(() => createTrophy(title, description, url, xp)).toThrow(
        'Invalid URL format'
      )
    })
  })

  describe('createTrophyWithDefaultImage', () => {
    it('should create a Trophy with the default image URL', () => {
      const title = 'First Win'
      const description = 'Won your first game'
      const xp = 100

      const trophy = createTrophyWithDefaultImage(title, description, xp)

      expect(trophy.title.value).toBe(title)
      expect(trophy.description).toBe(description)
      expect(trophy.url).toBe('https://www.svgrepo.com/show/530497/trophy.svg')
      expect(trophy.xp).toBe(xp)
    })

    it('should throw an error if the title is empty', () => {
      const title = ''
      const description = 'Won your first game'
      const xp = 100

      expect(() => createTrophyWithDefaultImage(title, description, xp)).toThrow(
        'Title cannot be empty'
      )
    })

    it('should throw an error if the XP is negative', () => {
      const title = 'First Win'
      const description = 'Won your first game'
      const xp = -10

      expect(() => createTrophyWithDefaultImage(title, description, xp)).toThrow(
        'XP cannot be negative'
      )
    })
  })
})
