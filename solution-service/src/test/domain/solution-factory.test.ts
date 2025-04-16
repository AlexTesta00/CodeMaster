import {
  SolutionFactory,
  SolutionFactoryError,
} from '../../main/nodejs/codemaster/servicies/solution/domain/solution-factory'
import mongoose from 'mongoose'
import { Language } from '../../main/nodejs/codemaster/servicies/solution/domain/language'

describe('TestSolutionFactory', () => {
  const timeout = 10_000

  const id = new mongoose.Types.ObjectId()
  const codequest = new mongoose.Types.ObjectId()
  const code = `
      class Solution {
        public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
            
        }
      }`
  const author = "username"
  const language = new Language("Java", "21")
  const fileEncoding = "CRLF"

  it('should create solution with correct values', () => {
    const newSolution = SolutionFactory.newSolution(id, code, codequest, author, language, fileEncoding, null)

    expect(newSolution).not.toBeNull()
    expect(newSolution.id).toBe(id)
    expect(newSolution.codequest).toBe(codequest)
    expect(newSolution.author).toBe(author)
    expect(newSolution.code).toBe(code)
    expect(newSolution.fileEncoding).toBe(fileEncoding)
    expect(newSolution.result).toBeNull()
  }, timeout)

  it('should throw error if content is empty', () => {
    expect(() => SolutionFactory.newSolution(id, '', codequest, author, language, fileEncoding, null)).toThrow(SolutionFactoryError.InvalidSolution)
  }, timeout)

  it('should throw error if ', () => {
    expect(() => SolutionFactory.newSolution(id, code, codequest, '', language, fileEncoding, null)).toThrow(SolutionFactoryError.InvalidAuthor)
  }, timeout)

  it('should throw error if language name is empty', () => {
    const invalidLanguage = new Language('', "21")
    expect(() => SolutionFactory.newSolution(id, code, codequest, author, invalidLanguage, fileEncoding, null)).toThrow(SolutionFactoryError.InvalidLanguage)
  }, timeout)

  it('should throw error if language version is empty', () => {
    const invalidLanguage = new Language('Java', '')
    expect(() => SolutionFactory.newSolution(id, code, codequest, author, invalidLanguage, fileEncoding, null)).toThrow(SolutionFactoryError.InvalidLanguage)
  }, timeout)

  it('should throw error if file encoding is empty', () => {
    expect(() => SolutionFactory.newSolution(id, code, codequest, author, language, '', null)).toThrow(SolutionFactoryError.InvalidEncodingFile)
  }, timeout)
})