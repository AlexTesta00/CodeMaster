import { Language } from "../../domain/language/language";

export interface LanguageRepository {
    saveAllAvailableLanguage(): Promise<void>;
    findLanguage(languageName: String): Promise<Language>;
    getAllLanguages(): Promise<Language[]>;
}