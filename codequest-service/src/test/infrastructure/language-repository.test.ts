import { MongoMemoryServer } from 'mongodb-memory-server'
import { LanguageRepository } from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/language-repository'
import { LanguageRepositoryImpl } from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/language-repository-impl'
import mongoose from 'mongoose'
import { LanguageFactory } from '../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory'
import * as languages from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/languages.json'
import { populateLanguages } from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/populate'

describe('TestLanguageRepository', () => {
  let mongoServer: MongoMemoryServer
  let languageRepo: LanguageRepository

  const timeout = 10000
  const exampleLanguage = LanguageFactory.newLanguage('Java', ['11', '17', '21'])
  const javaVersions = ['8', '11', '17', '21']
  const allLanguages = Array.from(Array(languages.length).keys()).map((i) => languages[i])

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
    languageRepo = new LanguageRepositoryImpl()
    await populateLanguages()
  }, timeout)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  }, timeout)

  describe('TEST language repository', () => {
    languageRepo = new LanguageRepositoryImpl()

    it(
      'should get all available languages',
      async () => {
        const languageDocs = await languageRepo.getAllLanguages()
        expect(languageDocs).toEqual(allLanguages)
      },
      timeout
    )

    it(
      'should return a specific language',
      async () => {
        const languageDoc = await languageRepo.findLanguage(exampleLanguage.name)
        expect(languageDoc.name).toBe(exampleLanguage.name)
        expect(languageDoc.versions).toEqual(javaVersions)
      },
      timeout
    )
  })
})
