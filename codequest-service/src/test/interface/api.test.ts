import { app } from '../../main/nodejs/codemaster/servicies/codequest/interfaces/server'
import supertest from 'supertest'
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_ERROR,
  NOT_FOUND,
  OK,
} from '../../main/nodejs/codemaster/servicies/codequest/interfaces/status'
import mongoose from 'mongoose'
import { Problem } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/problem'
import { Example } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/example'
import { LanguageFactory } from '../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory'
import * as dotenv from 'dotenv'
import { populateLanguages } from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/populate'
import { CodeQuestModel } from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/codequest/codequest-model'
import { Language } from '../../main/nodejs/codemaster/servicies/codequest/domain/language/language'
import { CodeQuest } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/codequest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Difficulty } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/difficulty'

dotenv.config()

describe('Test API', () => {
  let mongoServer: MongoMemoryServer

  const timeout: number = 20000
  const request = supertest(app)
  const author = 'example name'
  const problem = new Problem(
    'Problem example',
    [new Example('example1', 'example2', 'explanation')],
    ['constraints']
  )
  const title = 'Title example'
  const languages = [
    LanguageFactory.newLanguage('Java', '17', '.java'),
    LanguageFactory.newLanguage('Scala', '2.11.12', '.scala'),
  ]
  const difficulty = Difficulty.Medium
  const baseUrl = '/api/v1/codequests/'

  const codeQuest = {
    title: title,
    author: author,
    problem: problem,
    languages: languages,
    difficulty: difficulty,
  }

  const codeQuest2 = {
    title: title + '2',
    author: author + '2',
    problem: problem,
    languages: languages,
    difficulty: difficulty,
  }

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
    await populateLanguages()
  }, timeout)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  function checkCodequest(codequest: CodeQuest) {
    expect(codequest).toHaveProperty('author', author)
    expect(codequest).toHaveProperty('title', title)
    expect(codequest).toHaveProperty('problem', problem)
    expect(
      codequest.languages.map((langDoc: Language) =>
        LanguageFactory.newLanguage(langDoc.name, langDoc.version, langDoc.fileExtension)
      )
    ).toEqual(languages)
    expect(codequest).toHaveProperty('difficulty.name', difficulty.name)
  }

  describe('Test POST new codequest', () => {
    afterEach(async () => {
      await CodeQuestModel.deleteMany({})
    })

    it(
      'should return 201 and POST codequest',
      async () => {
        const response = await request
          .post(baseUrl)
          .send(codeQuest)
          .set('Accept', 'application/json')

        expect(response.status).toBe(CREATED)
        expect(response.body.message).toBe('Codequests add')
        expect(response.body.success).toBe(true)
        checkCodequest(response.body.codequest)
      },
      timeout
    )

    it(
      "should return 400 and cannot POST codequest because author's name is empty",
      async () => {
        const invalidCodequest = {
          title: title,
          author: null,
          problem: problem,
          languages: languages,
          difficulty: difficulty,
        }
        const response = await request
          .post(baseUrl)
          .send(invalidCodequest)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe("Invalid nickname: this user doesn't exist")
      },
      timeout
    )

    it(
      'should return 400 and cannot POST codequest because title is empty',
      async () => {
        const invalidCodequest = {
          title: null,
          author: author,
          problem: problem,
          languages: languages,
          difficulty: difficulty,
        }
        const response = await request
          .post(baseUrl)
          .send(invalidCodequest)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe("Invalid title: title's body cannot be empty")
      },
      timeout
    )

    it(
      'should return 400 and cannot POST codequest because problem is null',
      async () => {
        const invalidCodequest = {
          title: title,
          author: author,
          problem: null,
          languages: languages,
          difficulty: difficulty,
        }
        const response = await request
          .post(baseUrl)
          .send(invalidCodequest)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe(
          "Invalid problem: problem's body cannot be empty"
        )
      },
      timeout
    )

    it(
      "should return 400 and cannot POST codequest because problem's examples are empty",
      async () => {
        const noExampleProblem = new Problem(
          'Problem example',
          [new Example('', '', 'explanation')],
          ['constraints']
        )

        const invalidCodequest = {
          title: title,
          author: author,
          problem: noExampleProblem,
          languages: languages,
          difficulty: difficulty,
        }
        const response = await request
          .post(baseUrl)
          .send(invalidCodequest)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Invalid problem: invalid examples')
      },
      timeout
    )

    it(
      'should return 400 and cannot POST codequest because languages name are null',
      async () => {
        const invalidCodequest = {
          title: title,
          author: author,
          problem: problem,
          languages: null,
          difficulty: difficulty,
        }
        const response = await request
          .post(baseUrl)
          .send(invalidCodequest)
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Invalid languages: languages cannot be null')
      },
      timeout
    )

    it(
      'should return 404 and cannot POST codequest because languages are not available',
      async () => {
        const invalidLanguage = [LanguageFactory.newLanguage('C', 'C99', '.c')]
        const invalidCodequest = {
          title: title,
          author: author,
          problem: problem,
          languages: invalidLanguage,
        }
        const response = await request
          .post(baseUrl)
          .send(invalidCodequest)
          .set('Accept', 'application/json')

        expect(response.status).toBe(NOT_FOUND)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('This language is not available')
      },
      timeout
    )
  })

  describe('Test GET codequest', () => {
    beforeEach(async () => {
      await request.post(baseUrl).send(codeQuest).set('Accept', 'application/json')
      await request.post(baseUrl).send(codeQuest2).set('Accept', 'application/json')
    }, timeout)

    afterEach(async () => {
      await CodeQuestModel.deleteMany({})
    }, timeout)

    it(
      'should return 200 and GET all codequests',
      async () => {
        const response = await request.get(baseUrl)

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe('Codequests get')
        expect(response.body.success).toBe(true)
        expect(response.body.codequests.length).toBe(2)
        expect(response.body.codequests[1]).toHaveProperty('author', author + '2')
        expect(response.body.codequests[1]).toHaveProperty('title', title + '2')
        expect(response.body.codequests[1]).toHaveProperty('problem', problem)
        expect(
          response.body.codequests[1].languages.map((langDoc: Language) =>
            LanguageFactory.newLanguage(
              langDoc.name,
              langDoc.version,
              langDoc.fileExtension
            )
          )
        ).toEqual(languages)
        checkCodequest(response.body.codequests[0])
      },
      timeout
    )

    it(
      'should return 200 and GET codequest by id',
      async () => {
        const addCodequest = await request
          .post(baseUrl)
          .send(codeQuest)
          .set('Accept', 'application/json')
        const response = await request.get(baseUrl + addCodequest.body.codequest.id)

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe('Codequest get')
        expect(response.body.success).toBe(true)
        checkCodequest(response.body.codequest)
      },
      timeout
    )

    it(
      'should return 200 and GET codequests by author',
      async () => {
        const response = await request.get(baseUrl + 'authors/' + author)

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe('Codequests get')
        expect(response.body.success).toBe(true)
        expect(response.body.codequests.length).toBe(1)
        checkCodequest(response.body.codequests[0])
      },
      timeout
    )

    it(
      'should return 200 and GET codequests by language',
      async () => {
        const language = {
          name: languages[0].name,
        }
        const response = await request
          .get(baseUrl + 'languages/')
          .send(language)
          .set('Accept', 'application/json')

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe('Codequests get')
        expect(response.body.success).toBe(true)
        expect(response.body.codequests.length).toBe(2)
        checkCodequest(response.body.codequests[0])
      },
      timeout
    )

    it(
      'should return 200 and GET codequests by difficulty',
      async () => {
        const difficulty = {
          name: Difficulty.Medium.name,
        }
        const response = await request
          .get(baseUrl + 'difficulty/')
          .send(difficulty)
          .set('Accept', 'application/json')

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe('Codequests get')
        expect(response.body.success).toBe(true)
        expect(response.body.codequests.length).toBe(2)
        checkCodequest(response.body.codequests[0])
      },
      timeout
    )

    it(
      'should return 200 and an empty list if there are no codequests created by a user',
      async () => {
        const author = 'fake username'
        const response = await request.get(baseUrl + 'authors/' + author)

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe('Codequests get')
        expect(response.body.success).toBe(true)
        expect(response.body.codequests).toStrictEqual([])
      },
      timeout
    )

    it(
      "should return 404 if the codequest id doesn't exist",
      async () => {
        const fakeId = new mongoose.Types.ObjectId()
        const response = await request.get(baseUrl + fakeId)

        expect(response.status).toBe(INTERNAL_ERROR)
        expect(response.body.message).toBe('No codequest found with id: ' + fakeId)
        expect(response.body.success).toBe(false)
      },
      timeout
    )

    it(
      "should return 404 if the codequest id doesn't exist",
      async () => {
        const fakeDifficulty = {
          name: Difficulty.Hard,
        }
        const response = await request
          .get(baseUrl + 'difficulty')
          .send(fakeDifficulty)
          .set('Accept', 'application/json')

        expect(response.status).toBe(NOT_FOUND)
        expect(response.body.message).toBe(
          'CodeQuests with difficulty "' + fakeDifficulty.name + '" does not exist'
        )
        expect(response.body.success).toBe(false)
      },
      timeout
    )

    it(
      'should return 404 if language is not available',
      async () => {
        const invalidLanguage = {
          name: 'C',
          versions: ['C99'],
        }
        const response = await request
          .get(baseUrl + 'languages')
          .send(invalidLanguage)
          .set('Accept', 'application/json')

        expect(response.status).toBe(NOT_FOUND)
        expect(response.body.message).toBe('This language is not available')
        expect(response.body.success).toBe(false)
      },
      timeout
    )
  })

  describe('Test PUT codequest', () => {
    afterEach(async () => {
      await CodeQuestModel.deleteMany({})
    })

    it(
      'should return 200 and update problem',
      async () => {
        const postResponse = await request
          .post(baseUrl)
          .send(codeQuest)
          .set('Accept', 'application/json')
        const id = postResponse.body.codequest.id
        const newProblem = new Problem(
          'New body',
          [new Example('new example1', 'new example2', 'new explanation')],
          ['new constraints']
        )
        const putResponse = await request
          .put(baseUrl + 'codequest-problem/' + id)
          .send({ problem: newProblem })
          .set('Accept', 'application/json')

        expect(putResponse.status).toBe(OK)
        expect(putResponse.body.message).toBe('Codequest put')
        expect(putResponse.body.success).toBe(true)

        const response = await request.get(baseUrl + id)

        expect(response.body.codequest).toHaveProperty('problem', newProblem)
      },
      timeout
    )

    it(
      "should return 200 and update problem's title",
      async () => {
        const postResponse = await request
          .post(baseUrl)
          .send(codeQuest)
          .set('Accept', 'application/json')
        const id = postResponse.body.codequest.id
        const newTitle = 'New Title'
        const putResponse = await request
          .put(baseUrl + 'codequest-title/' + id)
          .send({ title: newTitle })
          .set('Accept', 'application/json')

        expect(putResponse.status).toBe(OK)
        expect(putResponse.body.message).toBe('Codequest put')
        expect(putResponse.body.success).toBe(true)

        const response = await request.get(baseUrl + id)

        expect(response.body.codequest).toHaveProperty('title', newTitle)
      },
      timeout
    )

    it(
      "should return 200 and update problem's languages",
      async () => {
        const postResponse = await request
          .post(baseUrl)
          .send(codeQuest)
          .set('Accept', 'application/json')
        const id = postResponse.body.codequest.id
        const newLanguages = [LanguageFactory.newLanguage('Scala', '2.11.12', '.scala')]
        const putResponse = await request
          .put('/api/v1/codequests/codequest-languages/' + id)
          .send({ languages: newLanguages })
          .set('Accept', 'application/json')

        expect(putResponse.status).toBe(OK)
        expect(putResponse.body.message).toBe('Codequest put')
        expect(putResponse.body.success).toBe(true)

        const response = await request.get(baseUrl + id)

        expect(response.body.codequest).toHaveProperty('languages', newLanguages)
      },
      timeout
    )

    it(
      'should return 404 if the codequest id is invalid',
      async () => {
        const fakeId = new mongoose.Types.ObjectId()
        const putTitle = await request
          .put(baseUrl + 'codequest-title/' + fakeId)
          .send({ title: title })
          .set('Accept', 'application/json')

        expect(putTitle.status).toBe(NOT_FOUND)
        expect(putTitle.body.message).toBe('No codequest found with given id')
        expect(putTitle.body.success).toBe(false)

        const putLanguages = await request
          .put(baseUrl + 'codequest-languages/' + fakeId)
          .send({ languages: languages })
          .set('Accept', 'application/json')

        expect(putLanguages.status).toBe(NOT_FOUND)
        expect(putLanguages.body.message).toBe('No codequest found with given id')
        expect(putLanguages.body.success).toBe(false)

        const putProblem = await request
          .put(baseUrl + 'codequest-problem/' + fakeId)
          .send({ problem: problem })
          .set('Accept', 'application/json')

        expect(putProblem.status).toBe(NOT_FOUND)
        expect(putProblem.body.message).toBe('No codequest found with given id')
        expect(putProblem.body.success).toBe(false)
      },
      timeout
    )
  })

  describe('Test DELETE codequest', () => {
    afterEach(async () => {
      await CodeQuestModel.deleteMany({})
    })

    it(
      'should get 200 and DELETE codequest',
      async () => {
        const postResponse = await request
          .post(baseUrl)
          .send(codeQuest)
          .set('Accept', 'application/json')
        const id = postResponse.body.codequest.id

        const deleteResponse = await request.delete(baseUrl + id)

        expect(deleteResponse.status).toBe(OK)
        expect(deleteResponse.body.message).toBe('Codequest delete')
        expect(deleteResponse.body.success).toBe(true)

        const getResponse = await request.get(baseUrl + id)

        expect(getResponse.status).toBe(INTERNAL_ERROR)
        expect(getResponse.body.message).toBe('No codequest found with id: ' + id)
        expect(getResponse.body.success).toBe(false)
      },
      timeout
    )

    it(
      'should get 200 and DELETE codequest',
      async () => {
        await request.post(baseUrl).send(codeQuest).set('Accept', 'application/json')
        const invalidId = new mongoose.Types.ObjectId()

        const deleteResponse = await request.delete(baseUrl + invalidId)

        expect(deleteResponse.status).toBe(NOT_FOUND)
        expect(deleteResponse.body.message).toBe('No codequest found with given id')
        expect(deleteResponse.body.success).toBe(false)
      },
      timeout
    )
  })
})
