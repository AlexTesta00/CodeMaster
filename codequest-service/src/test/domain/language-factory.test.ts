import { LanguageError } from '../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory'
import { LanguageFactory } from '../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory'

describe('TestCodeQuestFactory', () => {
  const timeout = 10000
  const name = 'Java'
  const version = '17'
  const fileExtension = '.java'

  it(
    'should create language with correct values',
    async () => {
      const language = LanguageFactory.newLanguage(name, version, fileExtension)
      expect(language).not.toBeNull()
      expect(language.name).toBe(name)
      expect(language.version).toBe(version)
    },
    timeout
  )

  it(
    'should throw error when create codequest if language name is invalid',
    async () => {
      expect(() => {
        LanguageFactory.newLanguage('', version, fileExtension)
      }).toThrow(LanguageError.InvalidName)
    },
    timeout
  )

  it(
    'should throw error when create codequest if language versions is empty',
    async () => {
      expect(() => {
        LanguageFactory.newLanguage(name, '', fileExtension)
      }).toThrow(LanguageError.InvalidVersion)
    },
    timeout
  )
})
