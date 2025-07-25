import { MongoMemoryServer } from 'mongodb-memory-server'
import { CodeQuestServiceImpl } from '../../main/nodejs/codemaster/servicies/codequest/application/codequest-service-impl'
import mongoose from 'mongoose'
import { Problem } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/problem'
import { Example } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/example'
import { LanguageFactory } from '../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory'
import dotenv from 'dotenv'
import { CodeQuestServiceError } from '../../main/nodejs/codemaster/servicies/codequest/application/codequest-service'
import { CodeQuestModel } from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/codequest/codequest-model'
import { Difficulty } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/difficulty'
import { CodeQuest } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/codequest'
import { MockRabbitMqEventPublisher } from '../MockRabbitMqEventPublisher'

describe('TestCodequestService', () => {
  let mongoServer: MongoMemoryServer
  let service: CodeQuestServiceImpl
  const mockPublisher = new MockRabbitMqEventPublisher()

  const timeout = 15000
  const author = 'exampleName'
  const problem = new Problem(
    'Problem example',
    [new Example('example1', 'example2', 'explanation')],
    ['constraints']
  )
  const title: string = 'Title Example'
  const languages = [
    LanguageFactory.newLanguage('Java', '17', '.java'),
    LanguageFactory.newLanguage('Scala', '2.11.12', '.scala'),
  ]
  const difficulty = Difficulty.Medium

  beforeAll(async () => {
    service = new CodeQuestServiceImpl(mockPublisher)

    dotenv.config()

    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
    await service.populateLanguages()
  }, timeout)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  }, timeout)

  afterEach(async () => {
    await CodeQuestModel.deleteMany({})
  }, timeout)

  describe('TEST save new codequests', () => {
    it(
      'should add new codequests correctly',
      async () => {
        const codequest = await service.addCodeQuest(
          title,
          author,
          problem,
          null,
          languages,
          difficulty
        )

        expect(codequest).not.toBeNull()
        expect(codequest.problem.description).toBe(problem.description)
        expect(codequest.problem.examples).toEqual(problem.examples)
        expect(codequest.problem.constraints).toEqual(problem.constraints)
        expect(codequest.title).toBe(title)
        expect(codequest.author).toBe(author)
        expect(
          codequest.languages.map((langDoc) =>
            LanguageFactory.newLanguage(
              langDoc.name,
              langDoc.version,
              langDoc.fileExtension
            )
          )
        ).toEqual(languages)
        expect(codequest.difficulty).toBe(difficulty)
      },
      timeout
    )

    it(
      'should throw error if languages does not exist in the database',
      async () => {
        const invalidLanguage = LanguageFactory.newLanguage('C', 'C99', '.c')

        await expect(() =>
          service.addCodeQuest(
            title,
            author,
            problem,
            null,
            [invalidLanguage],
            difficulty
          )
        ).rejects.toThrow(CodeQuestServiceError.LanguageNotFound)
      },
      timeout
    )
  })

  describe('TEST get codequests', () => {
    it(
      'should retrieve all codequests',
      async () => {
        const codequests = []
        codequests.push(
          await service.addCodeQuest(
            'Code quest 1',
            author,
            problem,
            null,
            languages,
            difficulty
          )
        )
        codequests.push(
          await service.addCodeQuest(
            'Code quest 2',
            author,
            problem,
            null,
            languages,
            difficulty
          )
        )

        expect((await service.getCodeQuests()).length).toBe(codequests.length)
      },
      timeout
    )

    it(
      'should return an empty list if there are no codequest',
      async () => {
        expect(await service.getCodeQuests()).toStrictEqual([])
      },
      timeout
    )

    it(
      'should retrieve codequest by id',
      async () => {
        const newCodequest = await service.addCodeQuest(
          title,
          author,
          problem,
          null,
          languages,
          difficulty
        )
        const foundCodequest = await service.getCodeQuestById(newCodequest.id)

        expect(foundCodequest).not.toBeNull()
        expect(foundCodequest.problem.description).toBe(newCodequest.problem.description)
        expect(
          foundCodequest.problem.examples.map(
            (ex) => new Example(ex.input, ex.output, ex.explanation!)
          )
        ).toEqual(newCodequest.problem.examples)
        expect(foundCodequest.problem.constraints).toEqual(
          newCodequest.problem.constraints
        )
        expect(foundCodequest.title).toBe(newCodequest.title)
        expect(foundCodequest.author).toBe(newCodequest.author)
        expect(
          foundCodequest.languages.map((langDoc) =>
            LanguageFactory.newLanguage(
              langDoc.name,
              langDoc.version,
              langDoc.fileExtension
            )
          )
        ).toEqual(languages)
        expect(foundCodequest.difficulty).toBe(difficulty)
      },
      timeout
    )

    it(
      'should throw error if there are no codequest with given id',
      async () => {
        await service.addCodeQuest(title, author, problem, null, languages, difficulty)
        const newId = new mongoose.Types.ObjectId().toString()

        await expect(() => service.getCodeQuestById(newId)).rejects.toThrow(
          CodeQuestServiceError.InvalidCodeQuestId
        )
      },
      timeout
    )

    it(
      'should retrieve all codequests created by a user',
      async () => {
        const newCodequest = await service.addCodeQuest(
          title,
          author,
          problem,
          null,
          languages,
          difficulty
        )
        const foundCodequests = await service.getCodeQuestsByAuthor(newCodequest.author)

        foundCodequests.forEach((codequest) => {
          expect(codequest).not.toBeNull()
          expect(codequest.problem.description).toBe(newCodequest.problem.description)
          expect(
            codequest.problem.examples.map(
              (ex) => new Example(ex.input, ex.output, ex.explanation!)
            )
          ).toEqual(newCodequest.problem.examples)
          expect(codequest.problem.constraints).toEqual(newCodequest.problem.constraints)
          expect(codequest.title).toBe(newCodequest.title)
          expect(codequest.author).toBe(newCodequest.author)
          expect(
            codequest.languages.map((langDoc) =>
              LanguageFactory.newLanguage(
                langDoc.name,
                langDoc.version,
                langDoc.fileExtension
              )
            )
          ).toEqual(languages)
          expect(codequest.difficulty).toBe(difficulty)
        })
      },
      timeout
    )

    it(
      'should retrieve all codequests created by difficulty',
      async () => {
        const newCodequest = await service.addCodeQuest(
          title,
          author,
          problem,
          null,
          languages,
          difficulty
        )
        const foundCodequests = await service.getCodeQuestsByDifficulty(
          newCodequest.difficulty.name
        )

        foundCodequests.forEach((codequest) => {
          expect(codequest).not.toBeNull()
          expect(codequest.problem.description).toBe(newCodequest.problem.description)
          expect(
            codequest.problem.examples.map(
              (ex) => new Example(ex.input, ex.output, ex.explanation!)
            )
          ).toEqual(newCodequest.problem.examples)
          expect(codequest.problem.constraints).toEqual(newCodequest.problem.constraints)
          expect(codequest.title).toBe(newCodequest.title)
          expect(codequest.author).toBe(newCodequest.author)
          expect(
            codequest.languages.map((langDoc) =>
              LanguageFactory.newLanguage(
                langDoc.name,
                langDoc.version,
                langDoc.fileExtension
              )
            )
          ).toEqual(languages)
          expect(codequest.difficulty).toBe(difficulty)
        })
      },
      timeout
    )

    it(
      'should retrieve all codequests with given language',
      async () => {
        const newCodequest = await service.addCodeQuest(
          title,
          author,
          problem,
          null,
          languages,
          difficulty
        )
        const language = LanguageFactory.newLanguage(
          languages[0].name,
          languages[0].version,
          languages[0].fileExtension
        )
        const foundCodequests = await service.getCodeQuestsByLanguage(language.name)

        foundCodequests.forEach((codequest) => {
          expect(codequest).not.toBeNull()
          expect(codequest.problem.description).toBe(newCodequest.problem.description)
          expect(
            codequest.problem.examples.map(
              (ex) => new Example(ex.input, ex.output, ex.explanation!)
            )
          ).toEqual(newCodequest.problem.examples)
          expect(codequest.problem.constraints).toEqual(newCodequest.problem.constraints)
          expect(codequest.title).toBe(newCodequest.title)
          expect(codequest.author).toBe(newCodequest.author)
          expect(
            codequest.languages.map((langDoc) =>
              LanguageFactory.newLanguage(
                langDoc.name,
                langDoc.version,
                langDoc.fileExtension
              )
            )
          ).toContainEqual(language)
          expect(codequest.difficulty).toBe(difficulty)
        })
      },
      timeout
    )

    it(
      'should throw error if languages does not exist in the database',
      async () => {
        const invalidLanguage = LanguageFactory.newLanguage('C', 'C99', '.c')

        await expect(() =>
          service.getCodeQuestsByLanguage(invalidLanguage.name)
        ).rejects.toThrow(CodeQuestServiceError.LanguageNotFound)
      },
      timeout
    )
  })

  describe('TEST update codequests', () => {
    let codequest: CodeQuest
    const newProblem = new Problem(
      'New Problem',
      [new Example('input', 'output', 'explanation')],
      []
    )
    const newId = new mongoose.Types.ObjectId().toString()
    const newLanguages = [LanguageFactory.newLanguage('Java', '17', '.java')]
    const newTitle = 'New Title'
    const newDifficulty = Difficulty.Easy

    beforeEach(async () => {
      codequest = await service.addCodeQuest(
        title,
        author,
        problem,
        null,
        languages,
        difficulty
      )
    }, timeout)

    afterEach(async () => {
      await CodeQuestModel.deleteMany({})
    }, timeout)

    it(
      "should update a codequest' problem correctly",
      async () => {
        const updatedCodequest = await service.updateProblem(codequest.id, newProblem)
        expect(updatedCodequest.problem.description).toBe(newProblem.description)
        expect(
          updatedCodequest.problem.examples.map(
            (ex) => new Example(ex.input, ex.output, ex.explanation!)
          )
        ).toEqual(newProblem.examples)
        expect(updatedCodequest.problem.constraints).toEqual(newProblem.constraints)
      },
      timeout
    )

    it(
      "should update a codequest's title correctly",
      async () => {
        const updatedCodequest = await service.updateTitle(codequest.id, newTitle)
        expect(updatedCodequest.title).toBe(newTitle)
      },
      timeout
    )

    it(
      "should update a codequest's Languages correctly",
      async () => {
        const updatedCodequest = await service.updateLanguages(codequest.id, newLanguages)
        expect(
          updatedCodequest.languages.map((langDoc) =>
            LanguageFactory.newLanguage(
              langDoc.name,
              langDoc.version,
              langDoc.fileExtension
            )
          )
        ).toEqual(newLanguages)
      },
      timeout
    )

    it(
      "should update a codequest's difficulty correctly",
      async () => {
        const updatedCodequest = await service.updateDifficulty(
          codequest.id,
          newDifficulty
        )
        expect(updatedCodequest.difficulty).toEqual(newDifficulty)
      },
      timeout
    )

    it(
      'should throw error if the given new languages are not available',
      async () => {
        const newLanguages = [LanguageFactory.newLanguage('C', 'C99', '.c')]

        await expect(() =>
          service.updateLanguages(codequest.id, newLanguages)
        ).rejects.toThrow(CodeQuestServiceError.LanguageNotFound)
      },
      timeout
    )

    it(
      'should throw error if there are no codequest to update with given id',
      async () => {
        await expect(() =>
          service.updateDifficulty(newId, newDifficulty)
        ).rejects.toThrow(CodeQuestServiceError.CodeQuestNotFound)
        await expect(() => service.updateProblem(newId, newProblem)).rejects.toThrow(
          CodeQuestServiceError.CodeQuestNotFound
        )
        await expect(() => service.updateTitle(newId, 'New Title')).rejects.toThrow(
          CodeQuestServiceError.CodeQuestNotFound
        )
        await expect(() => service.updateLanguages(newId, newLanguages)).rejects.toThrow(
          CodeQuestServiceError.CodeQuestNotFound
        )
      },
      timeout
    )
  })

  describe('TEST delete codequest', () => {
    it(
      'should delete a codequest correctly',
      async () => {
        const newCodequest = await service.addCodeQuest(
          title,
          author,
          problem,
          null,
          languages,
          difficulty
        )

        const deleted = await service.delete(newCodequest.id)
        await expect(() => service.getCodeQuestById(deleted.id)).rejects.toThrow(
          CodeQuestServiceError.InvalidCodeQuestId
        )
      },
      timeout
    )

    it(
      'should delete all codequests created by a user correctly',
      async () => {
        await service.addCodeQuest(title, author, problem, null, languages, difficulty)

        await service.addCodeQuest(title, author, problem, null, languages, difficulty)

        await service.deleteAllCodequestsByAuthor(author)
        expect(await service.getCodeQuests()).toStrictEqual([])
      },
      timeout
    )

    it(
      'should throw error if there are no codequest with given id',
      async () => {
        await service.addCodeQuest(title, author, problem, null, languages, difficulty)
        const newId = new mongoose.Types.ObjectId().toString()

        await expect(() => service.delete(newId)).rejects.toThrow(
          CodeQuestServiceError.CodeQuestNotFound
        )
      },
      timeout
    )
  })
})
