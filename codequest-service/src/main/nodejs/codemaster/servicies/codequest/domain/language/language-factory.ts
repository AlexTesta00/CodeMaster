import { Language } from "./language";

export class LanguageFactory{
    static createLanguage(name: String, versions: String[]): Language {
        if(!name || name == "") {
            throw new LanguageError.InvalidName('Invalid code language name: \"' + name + '\"')
        } 

        if(!versions || versions.length == 0) {
            throw new LanguageError.InvalidVersion('Invalid version of \"' + name + '\" language')
        }

        return new Language(name, versions);
    }
}

export class LanguageError {
    static InvalidName = class extends Error{};
    static InvalidVersion = class extends Error{};
}