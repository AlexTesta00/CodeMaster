import {Language} from "../../domain/language/language";
import {LanguageFactory} from "../../domain/language/language-factory";
import {LanguageModel} from "./language-model";
import {LanguageRepository} from "./language-repository";
import * as languages from "./languages.json"

export class LanguageRepositoryImpl implements LanguageRepository {

    async findLanguage(languageName: String): Promise<Language> {
        const languageDoc = await LanguageModel.findOne({ name: languageName }).orFail();
        return LanguageFactory.createLanguage(languageDoc.name, languageDoc.versions);
    }
    async getAllLanguages(): Promise<Language[]> {
        const languageDocs = await LanguageModel.find({}).orFail();
        return languageDocs.map(lang => LanguageFactory.createLanguage(lang.name, lang.versions));
    }
    async saveAllAvailableLanguage(): Promise<void> {
        for (let i = 0; i < languages.length; i++) {
            const language = languages[i];
            const languageDoc = await new LanguageModel({
                name: language.name,
                versions: language.versions
            }).save()
        }
    }
}