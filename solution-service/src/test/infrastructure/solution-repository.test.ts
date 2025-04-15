import mongoose, { Error } from 'mongoose'
import { SolutionRepository } from '../../main/nodejs/codemaster/servicies/solution/infrastructure/solution-repository'
import {
  SolutionRepositoryImpl
} from '../../main/nodejs/codemaster/servicies/solution/infrastructure/solution-repository-impl'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Language } from '../../main/nodejs/codemaster/servicies/solution/domain/language'
import { SolutionFactory } from '../../main/nodejs/codemaster/servicies/solution/domain/solution-factory'
import { SolutionModel } from '../../main/nodejs/codemaster/servicies/solution/infrastructure/solution-model'
import { Solution } from '../../main/nodejs/codemaster/servicies/solution/domain/solution'

describe('TestSolutionRepository', () => {
  const timeout = 10_000
  let mongoServer: MongoMemoryServer
  let solutionRepo: SolutionRepository

  const id = new mongoose.Types.ObjectId()
  const author = 'exampleName'
  const content = `
      class Solution {
        public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
            
        }
      }`
  const fileEncoding = 'CRLF'
  const codequest = new mongoose.Types.ObjectId()
  const language = new Language('Java', '21')
  const result = [1,2,3,4]

  const newSolution = SolutionFactory.newSolution(id, content, codequest, author, language, fileEncoding, result)

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
    solutionRepo = new SolutionRepositoryImpl()
  }, timeout)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  }, timeout)

  afterEach(async () => {
    await SolutionModel.deleteMany({})
  }, timeout)

  function checkSolution(sol: Solution) {

    expect(sol).not.toBeNull()
    expect(sol.id).toStrictEqual(id)
    expect(sol.codequest).toStrictEqual(codequest)
    expect(sol.author).toBe(author)
    expect(sol.content).toBe(content)
    expect(sol.fileEncoding).toBe(fileEncoding)
    expect(sol.result).toStrictEqual(result)
  }

  describe('Test add new solution', () => {

    it('should add new solution correctly', async () => {
      const solution = await solutionRepo.addNewSolution(newSolution)

      checkSolution(solution)
    }, timeout)
  })

  describe('Test find solution', () => {
    beforeEach(async () => {
      await solutionRepo.addNewSolution(newSolution)
    }, timeout)

    it('should find solution by id', async () => {
      const solution = await solutionRepo.findSolutionById(id)

      checkSolution(solution)
    })
  })

  describe('Test update solution', () => {
    beforeEach(async () => {
      await solutionRepo.addNewSolution(newSolution)
    }, timeout)

    it('should update content correctly', async () => {
      const newContent = `
        class Solution {
          public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
              l1.append(l2)
          }
        }`
      await solutionRepo.updateContent(id, newContent)
      const solution = await solutionRepo.findSolutionById(id)

      expect(solution).not.toBeNull()
      expect(solution.id).toStrictEqual(id)
      expect(solution.content).toBe(newContent)
    })

    it('should update language correctly', async () => {
      const newLanguage = new Language('Scala', '3.3')
      await solutionRepo.updateLanguage(id, newLanguage)
      const solution = await solutionRepo.findSolutionById(id)

      expect(solution).not.toBeNull()
      expect(solution.id).toStrictEqual(id)
      expect(solution.language.name).toBe(newLanguage.name)
      expect(solution.language.version).toBe(newLanguage.version)
    })

    it('should update result correctly', async () => {
      const newResult = "new result"
      await solutionRepo.updateResult(id, newResult)
      const solution = await solutionRepo.findSolutionById(id)

      expect(solution).not.toBeNull()
      expect(solution.id).toStrictEqual(id)
      expect(solution.result).toBe(newResult)
    })
  })

  describe('Test delete solution', () => {
    beforeEach(async () => {
      await solutionRepo.addNewSolution(newSolution)
    }, timeout)

    it('should find and delete solution correctly', async () => {
      const solution = await solutionRepo.removeSolution(id)

      expect(await SolutionModel.findOne(id)).toBeNull()
    })
  })
})