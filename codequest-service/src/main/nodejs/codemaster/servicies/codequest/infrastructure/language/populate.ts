import * as languages from "./languages.json";
import {LanguageModel} from "./language-model";

export const populateLanguages = async () => {
    for (let i = 0; i < languages.length; i++) {
        const language = languages[i];
        const languageDoc = await new LanguageModel({
            name: language.name,
            versions: language.versions
        }).save()
    }
}