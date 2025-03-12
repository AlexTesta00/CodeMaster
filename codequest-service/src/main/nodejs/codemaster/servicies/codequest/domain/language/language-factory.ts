import { Language } from "./language";
import { LanguageError } from "../error/language-error";

export class LanguageFactory{
    static createLanguage(name: String, versions: String[]): Language {
        if(!name || name == "") {
            throw new LanguageError.InvalidName('Can\'t find \"' + name + '\" code language in the database')
        } 

        if(!versions || versions.length == 0) {
            throw new LanguageError.InvalidVersion('This version of \"' + name + '\" is not available')
        }

        return new Language(name, versions);
    }
}