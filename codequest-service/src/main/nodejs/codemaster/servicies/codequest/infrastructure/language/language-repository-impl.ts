import { LanguageModel } from "../../domain/language/language-model";
import { LanguageRepository } from "./language-repository";

export class LanguageRepositoryImpl implements LanguageRepository {

    async saveAllAvailableLanguage(): Promise<void> {
        const languages = require('./languages.json')
        await new LanguageModel(languages).save();
    }
}