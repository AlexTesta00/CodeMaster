import {
  createDefaultLevel,
  createLevel,
} from '../../main/nodejs/codemaster/servicies/user/domain/level-factory'

describe('Level Functions', () => {
  describe('createLevel', () => {
    it('should create a Level with valid inputs', () => {
      const grade = 2
      const title = 'Intermediate'
      const xp = 100

      const level = createLevel(grade, title, xp)

      expect(level.grade.value).toBe(grade)
      expect(level.title).toBe(title)
      expect(level.xpLevel).toBe(xp)
    })

    it('should throw an error if grade is less than 1', () => {
      const grade = 0
      const title = 'Invalid Grade'
      const xp = 100

      expect(() => createLevel(grade, title, xp)).toThrow('Grade must be greater than 0')
    })

    it('should throw an error if title is empty', () => {
      const grade = 1
      const title = ''
      const xp = 100

      expect(() => createLevel(grade, title, xp)).toThrow('Title must not be empty')
    })

    it('should throw an error if XP is less than 1', () => {
      const grade = 1
      const title = 'No XP'
      const xp = 0

      expect(() => createLevel(grade, title, xp)).toThrow('XP must be greater than to 0')
    })
  })

  describe('createDefaultLevel', () => {
    it('should create a default Level with grade 1, title "Novice", and XP 1', () => {
      const defaultLevel = createDefaultLevel()

      expect(defaultLevel.grade.value).toBe(1)
      expect(defaultLevel.title).toBe('Novice')
      expect(defaultLevel.xpLevel).toBe(1)
    })
  })
})
