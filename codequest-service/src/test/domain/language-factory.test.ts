import { LanguageError } from '../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory'
import { LanguageFactory } from '../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory'

describe('TestCodeQuestFactory', () => {
  const timeout = 10000
  const name = 'Java'
  const versions = ['17', '21']

  it(
    'should create language with correct values',
    async () => {
      const language = LanguageFactory.newLanguage(name, versions)
      expect(language).not.toBeNull()
      expect(language.name).toBe(name)
      expect(language.versions).toBe(versions)
    },
    timeout
  )

  it(
    'should throw error when create codequest if language name is invalid',
    async () => {
      expect(() => {
        LanguageFactory.newLanguage('', versions)
      }).toThrow(LanguageError.InvalidName)
    },
    timeout
  )

  it(
    'should throw error when create codequest if language versions is empty',
    async () => {
      expect(() => {
        LanguageFactory.newLanguage(name, [])
      }).toThrow(LanguageError.InvalidVersion)
    },
    timeout
  )
})
