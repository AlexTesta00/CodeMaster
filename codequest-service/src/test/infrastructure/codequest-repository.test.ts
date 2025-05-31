import mongoose from 'mongoose'
import { CodeQuest } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/codequest'
import { CodeQuestFactory } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/codequest-factory'
import { CodeQuestModel } from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/codequest/codequest-model'
import { CodeQuestRepositoryImpl } from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/codequest/codequest-repository-impl'
import { CodeQuestRepository } from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/codequest/codequest-repository'
import { LanguageFactory } from '../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory'
import { Problem } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/problem'
import { Example } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/example'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Difficulty } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/difficulty'

describe('TestCodeQuestRepository', () => {
  const timeout = 10000
  let mongoServer: MongoMemoryServer
  let codequestRepo: CodeQuestRepository
  const author = 'exampleName'
  const problem = new Problem(
    'Given two lists, sum all elements in a new list',
    [new Example('l1 = [2,4,3], l2 = [5,6,4]', '[7,0,8]', '342 + 465 = 807')],
    []
  )
  const title = 'Sum of numbers in a list'
  const languages = [
    LanguageFactory.newLanguage('Java', '17', '.java'),
    LanguageFactory.newLanguage('Scala', '2.11.12', '.scala'),
  ]
  const difficulty = Difficulty.Medium
  const firstCodequest: CodeQuest = CodeQuestFactory.newCodeQuest(
    new mongoose.Types.ObjectId().toString(),
    title,
    author,
    problem,
    null,
    languages,
    difficulty
  )
  const secondCodequest: CodeQuest = CodeQuestFactory.newCodeQuest(
    new mongoose.Types.ObjectId().toString(),
    title,
    author,
    problem,
    null,
    languages,
    difficulty
  )

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
    codequestRepo = new CodeQuestRepositoryImpl()
  }, timeout)

  beforeEach(async () => {
    await codequestRepo.save(firstCodequest)
    await codequestRepo.save(secondCodequest)
  }, timeout)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  }, timeout)

  afterEach(async () => {
    await CodeQuestModel.deleteMany({})
  }, timeout)

  describe('Test codequest creation', () => {
    it(
      'should create codequest with correct values',
      async () => {
        const foundCodeQuest = await codequestRepo.findCodeQuestById(firstCodequest.id)
        expect(foundCodeQuest).not.toBeNull()
        expect(foundCodeQuest?.problem.description).toBe(problem.description)
        expect(
          foundCodeQuest?.problem.examples.map(
            (ex) => new Example(ex.input, ex.output, ex.explanation!)
          )
        ).toEqual(problem.examples)
        expect(foundCodeQuest?.problem.constraints).toEqual(problem.constraints)
        expect(foundCodeQuest?.title).toBe(title)
        expect(foundCodeQuest?.author).toBe(author)
        expect(
          foundCodeQuest?.languages.map((langDoc) =>
            LanguageFactory.newLanguage(
              langDoc.name,
              langDoc.version,
              langDoc.fileExtension
            )
          )
        ).toEqual(languages)
        expect(foundCodeQuest?.difficulty.name).toBe(difficulty.name)
      },
      timeout
    )

    it(
      'should return all codequests published from the same author',
      async () => {
        const codequests = await codequestRepo.findCodeQuestsByAuthor(author)
        expect(codequests[0]).toStrictEqual(firstCodequest)
        expect(codequests[1]).toStrictEqual(secondCodequest)
      },
      timeout
    )

    it(
      'should return all codequests created',
      async () => {
        const codequests = await codequestRepo.getAllCodeQuests()
        expect(codequests.length).toBe(2)
      },
      timeout
    )

    it(
      'should return all codequests by given difficulty',
      async () => {
        const codequests = await codequestRepo.findCodeQuestsByDifficulty(difficulty.name)
        expect(codequests.length).toBe(2)
      },
      timeout
    )

    it('should return all codequests resolvable with given language', async () => {
      const codequests = await codequestRepo.findCodeQuestsByLanguage(languages[0].name)
      expect(codequests.length).toBe(2)
      expect(codequests[0]).toStrictEqual(firstCodequest)
      expect(codequests[1]).toStrictEqual(secondCodequest)
    })
  })

  describe('Test codequest update', () => {
    it(
      'should update the problem of the codequest as expected',
      async () => {
        const newCodequest = firstCodequest
        const newProblem = new Problem(
          'Given three lists, sum all elements as a number',
          [
            new Example(
              'l1 = [2,4,3], l2 = [5,6,4], l3 = [1,2,3]',
              '[9,3,0]',
              '342 + 465 + 123 = 930'
            ),
          ],
          []
        )
        newCodequest.problem = newProblem
        const updatedCodequest = await codequestRepo.updateProblem(
          firstCodequest.id,
          newProblem
        )
        expect(updatedCodequest).toStrictEqual(newCodequest)
      },
      timeout
    )

    it(
      'should update the title of the codequest as expected',
      async () => {
        const newCodequest = firstCodequest
        newCodequest.title = 'New Title'
        const updatedCodequest = await codequestRepo.updateTitle(
          firstCodequest.id,
          'New Title'
        )
        expect(updatedCodequest).toStrictEqual(newCodequest)
      },
      timeout
    )

    it(
      'should update the languages of the codequest as expected',
      async () => {
        const newCodequest = firstCodequest
        newCodequest.languages = [languages[0]]
        const updatedCodequest = await codequestRepo.updateLanguages(firstCodequest.id, [
          languages[0],
        ])
        expect(updatedCodequest).toStrictEqual(newCodequest)
      },
      timeout
    )

    it(
      'should update the difficulty of the codequest as expected',
      async () => {
        const newCodequest = firstCodequest
        newCodequest.difficulty = Difficulty.Easy
        const updatedCodequest = await codequestRepo.updateDifficulty(
          firstCodequest.id,
          Difficulty.Easy
        )
        expect(updatedCodequest).toStrictEqual(newCodequest)
      },
      timeout
    )
  })

  describe('Test codequest removal', () => {
    it(
      'should delete the codequest succesfully',
      async () => {
        const updatedCodequest = await codequestRepo.delete(firstCodequest.id)
        expect(
          await CodeQuestModel.findOne({ questId: updatedCodequest.id }).exec()
        ).toBeNull()
      },
      timeout
    )
  })
})
