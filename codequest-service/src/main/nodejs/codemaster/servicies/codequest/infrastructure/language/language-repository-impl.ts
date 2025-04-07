import { Language } from '../../domain/language/language'
import { LanguageFactory } from '../../domain/language/language-factory'
import { LanguageModel } from './language-model'
import { LanguageRepository } from './language-repository'

export class LanguageRepositoryImpl implements LanguageRepository {
  async findLanguage(languageName: string): Promise<Language> {
    const languageDoc = await LanguageModel.findOne({ name: languageName }).orFail()
    return LanguageFactory.newLanguage(languageDoc.name, languageDoc.versions)
  }
  async getAllLanguages(): Promise<Language[]> {
    const languageDocs = await LanguageModel.find({}).orFail()
    return languageDocs.map((lang) =>
      LanguageFactory.newLanguage(lang.name, lang.versions)
    )
  }
}
