import { Language } from "../../domain/language/language";

export interface LanguageRepository {
    saveAllAvailableLanguage(): Promise<void>;
    findLanguage(language: Language): Promise<Language>;
    getAllLanguages(): Promise<Language[]>;
}