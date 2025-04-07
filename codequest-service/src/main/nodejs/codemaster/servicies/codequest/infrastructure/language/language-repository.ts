import { Language } from '../../domain/language/language'

export interface LanguageRepository {
  findLanguage(languageName: string): Promise<Language>
  getAllLanguages(): Promise<Language[]>
}
