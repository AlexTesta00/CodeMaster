import {
  createDefaultLevel,
  createLevel,
} from '../../main/nodejs/codemaster/servicies/user/domain/level-factory'
import { isLeft, isRight } from 'fp-ts/Either'

describe('Level Functions', () => {
  describe('createLevel', () => {
    it('should create a Level with valid inputs', () => {
      const grade = 2
      const title = 'Intermediate'
      const xp = 100

      const level = createLevel(grade, title, xp)
      const result = isRight(level) ? level.right : null

      expect(result!.grade.value).toBe(grade)
      expect(result!.title).toBe(title)
      expect(result!.xpLevel).toBe(xp)
    })

    it('should throw an error if grade is less than 1', () => {
      const grade = 0
      const title = 'Invalid Grade'
      const xp = 100

      const level = createLevel(grade, title, xp)
      const result = isLeft(level) ? level.left : null

      expect(result!.message).toEqual('Grade must be greater than 0')
    })

    it('should throw an error if title is empty', () => {
      const grade = 1
      const title = ''
      const xp = 100

      const level = createLevel(grade, title, xp)
      const result = isLeft(level) ? level.left : null

      expect(result!.message).toEqual('Title cannot be empty')
    })

    it('should throw an error if XP is less than 1', () => {
      const grade = 1
      const title = 'No XP'
      const xp = 0

      const level = createLevel(grade, title, xp)
      const result = isLeft(level) ? level.left : null

      expect(result!.message).toEqual('XP must be greater than to 0')
    })
  })

  describe('createDefaultLevel', () => {
    it('should create a default Level with grade 1, title "Novice", and XP 1', () => {
      const defaultLevel = createDefaultLevel()
      const result = isRight(defaultLevel) ? defaultLevel.right : null
      expect(result!.grade.value).toBe(1)
      expect(result!.title).toBe('Novice')
      expect(result!.xpLevel).toBe(1)
    })
  })
})
