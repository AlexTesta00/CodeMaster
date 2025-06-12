import { Language } from '../../domain/language/language'
import { LanguageFactory } from '../../domain/language/language-factory'
import { LanguageModel } from './language-model'
import { LanguageRepository } from './language-repository'
import * as languages from './languages.json'

export class LanguageRepositoryImpl implements LanguageRepository {
  async findLanguage(languageName: string): Promise<Language> {
    const languageDoc = await LanguageModel.findOne({ name: languageName }).orFail()
    return LanguageFactory.newLanguage(
      languageDoc.name,
      languageDoc.version,
      languageDoc.fileExtension
    )
  }
  async getAllLanguages(): Promise<Language[]> {
    const languageDocs = await LanguageModel.find({}).orFail()
    return languageDocs.map((lang) =>
      LanguageFactory.newLanguage(lang.name, lang.version, lang.fileExtension)
    )
  }

  async insertAllLanguages(): Promise<void> {
    for (let i = 0; i < languages.length; i++) {
      const language = languages[i]
      try {
        await new LanguageModel({
          name: language.name,
          version: language.version,
          fileExtension: language.fileExtension,
        }).save()
      } catch (err) {
        throw err
      }
    }
  }
}
