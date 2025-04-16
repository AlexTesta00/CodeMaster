import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import {
  SolutionService,
  SolutionServiceError,
} from '../../main/nodejs/codemaster/servicies/solution/application/solution-service'
import { SolutionServiceImpl } from '../../main/nodejs/codemaster/servicies/solution/application/solution-service-impl'
import { Language } from '../../main/nodejs/codemaster/servicies/solution/domain/language'
import { SolutionModel } from '../../main/nodejs/codemaster/servicies/solution/infrastructure/solution-model'
import { Solution } from '../../main/nodejs/codemaster/servicies/solution/domain/solution'

describe('TestSolutionService', () => {
  let mongoServer: MongoMemoryServer
  let service: SolutionService

  const timeout = 15000
  const author = 'exampleName'
  const code = `
      class Solution {
        public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
            
        }
      }`
  const fileEncoding = 'CRLF'
  const codequest = new mongoose.Types.ObjectId()
  const language = new Language('Java', '21')
  const result = [1,2,3,4]

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
    service = new SolutionServiceImpl()
  }, timeout)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  }, timeout)

  afterEach(async () => {
    await SolutionModel.deleteMany({})
  }, timeout)

  function checkSolution(solution: Solution) {
    expect(solution).not.toBeNull()
    expect(solution.codequest).toStrictEqual(codequest)
    expect(solution.author).toBe(author)
    expect(solution.code).toBe(code)
    expect(solution.fileEncoding).toBe(fileEncoding)
    expect(solution.language.name).toBe(language.name)
    expect(solution.language.version).toBe(language.version)
    expect(solution.result).toStrictEqual(result)
  }

  describe('Test add new solution', () => {

    it('should add a new solution correctly', async () => {
      const solution = await service.addSolution(code, codequest, author, language, fileEncoding, result)

      checkSolution(solution)
    }, timeout)
  })

  describe('Test get solution by id', () => {

    let solution: Solution

    beforeEach(async () => {
      solution = await service.addSolution(code, codequest, author, language, fileEncoding, result)
    }, timeout)

    it('should return a solution by his id', async () => {
      const foundedSol = await service.getSolutionById(solution.id)

      checkSolution(foundedSol)
    }, timeout)

    it('should throw error if cannot find solution', async () => {
      const invalidId = new mongoose.Types.ObjectId()

      await expect(() => service.getSolutionById(invalidId)).rejects.toThrow(SolutionServiceError.SolutionNotFound)
    })
  })

  describe('Test update solution', () => {

    let solution: Solution

    beforeEach(async () => {
      solution = await service.addSolution(code, codequest, author, language, fileEncoding, result)
    }, timeout)

    it('should update a solution\'s code', async () => {
      const newCode = `
        class Solution {
          public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
              l1.append(l2)
          }
        }`
      await service.modifySolutionCode(solution.id, newCode)
      const updatedSolution = await service.getSolutionById(solution.id)

      expect(updatedSolution.code).toBe(newCode)
    }, timeout)

    it('should update a solution\'s language', async () => {
      const newLanguage = new Language('Scala', '3.3')
      await service.modifySolutionLanguage(solution.id, newLanguage)
      const updatedSolution = await service.getSolutionById(solution.id)

      expect(updatedSolution.language.name).toBe(newLanguage.name)
      expect(updatedSolution.language.version).toBe(newLanguage.version)
    }, timeout)

//    it('should update a solution\'s result', async () => {
//      const newResult = 'new result'
//      await service.executeCode(solution.id, newResult)
//      const updatedSolution = await service.getSolutionById(solution.id)
//
//      expect(updatedSolution.language).toBe(newLanguage)
//    }, timeout)

    it('should throw error if cannot find solution', async () => {
      const invalidId = new mongoose.Types.ObjectId()

      await expect(() => service.modifySolutionCode(invalidId, code)).rejects.toThrow(SolutionServiceError.SolutionNotFound)
      await expect(() => service.modifySolutionLanguage(invalidId, language)).rejects.toThrow(SolutionServiceError.SolutionNotFound)
      //await expect(() => service.executeCode(invalidId)).rejects.toThrow(SolutionServiceError.SolutionNotFound)
    })
  })

})