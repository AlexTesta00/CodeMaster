import { Language } from "../../domain/language/language";

export interface LanguageRepository {
    findLanguage(languageName: String): Promise<Language>;
    getAllLanguages(): Promise<Language[]>;
}