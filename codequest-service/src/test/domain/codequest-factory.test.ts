import {
  CodeQuestError,
  CodeQuestFactory,
} from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/codequest-factory'
import mongoose from 'mongoose'
import { LanguageFactory } from '../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory'
import { Problem } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/problem'
import { Example } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/example'
import { Difficulty } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/difficulty'

describe('TestCodeQuestFactory', () => {
  const timeout = 10000
  const author = 'example'
  const problem = new Problem(
    'Given two lists, sum all elements in a new list',
    [new Example('l1 = [2,4,3], l2 = [5,6,4]', '[7,0,8]', '342 + 465 = 807')],
    []
  )
  const title = 'Calculator'
  const id = new mongoose.Types.ObjectId().toString()
  const timestamp = new Date(Date.now())
  const languages = [
    LanguageFactory.newLanguage('Java', '17', '.java'),
    LanguageFactory.newLanguage('Scala', '2.11.12', '.scala'),
  ]
  const difficulty = Difficulty.Medium

  it(
    'should create codequest with correct values',
    async () => {
      const codequest = CodeQuestFactory.newCodeQuest(
        id,
        title,
        author,
        problem,
        timestamp,
        languages,
        difficulty
      )
      expect(codequest.id).toBe(id)
      expect(codequest.author).toBe(author)
      expect(codequest.problem).toBe(problem)
      expect(codequest.title).toBe(title)
      expect(codequest.timestamp).toBe(timestamp)
      expect(codequest.languages).toBe(languages)
    },
    timeout
  )

  it(
    "should throw error when create codequest if problem's body is is empty",
    async () => {
      const emptyProblem = new Problem(
        '',
        [new Example('l1 = [2,4,3], l2 = [5,6,4]', '[7,0,8]', '342 + 465 = 807')],
        []
      )
      expect(() => {
        CodeQuestFactory.newCodeQuest(
          id,
          title,
          author,
          emptyProblem,
          timestamp,
          languages,
          difficulty
        )
      }).toThrow(CodeQuestError.InvalidProblem)
    },
    timeout
  )

  it(
    "should throw error when create codequest if problem' examples is empty",
    async () => {
      const noExamples = new Problem(
        'Given two lists, sum all elements in a new list',
        [],
        []
      )
      expect(() => {
        CodeQuestFactory.newCodeQuest(
          id,
          title,
          author,
          noExamples,
          timestamp,
          languages,
          difficulty
        )
      }).toThrow(CodeQuestError.InvalidProblem)
    },
    timeout
  )

  it(
    "should throw error when create codequest if author's nickname is empty",
    async () => {
      expect(() => {
        CodeQuestFactory.newCodeQuest(
          id,
          title,
          '',
          problem,
          timestamp,
          languages,
          difficulty
        )
      }).toThrow(CodeQuestError.InvalidAuthor)
    },
    timeout
  )

  it(
    'should throw error when create codequest if title is empty',
    async () => {
      expect(() => {
        CodeQuestFactory.newCodeQuest(
          id,
          '',
          author,
          problem,
          timestamp,
          languages,
          difficulty
        )
      }).toThrow(CodeQuestError.InvalidTitle)
    },
    timeout
  )
})
