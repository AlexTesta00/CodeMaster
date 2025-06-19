import { Language } from '../../domain/language/language'

export interface LanguageRepository {
  insertAllLanguages(): Promise<void>
  findLanguage(languageName: string): Promise<Language>
  getAllLanguages(): Promise<Language[]>
}
