import { LanguageError } from "../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory";
import { LanguageFactory } from "../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory";

describe('TestCodeQuestFactory', () => {

    const name = 'Java';
    const versions = ["17", "21"];

    it('should create language with correct values', async () => {
        const language = LanguageFactory.createLanguage(name, versions);
        expect(language).not.toBeNull
        expect(language.name).toBe(name);
        expect(language.versions).toBe(versions)
    }, 10000);

    it('should throw error when create codequest if language name is invalid', async () => {
        expect(() => {LanguageFactory.createLanguage("", versions)}).toThrow(LanguageError.InvalidName);
    }, 10000);

    it('should throw error when create codequest if language versions is empty', async () => {
        expect(() => {LanguageFactory.createLanguage(name, [])}).toThrow(LanguageError.InvalidVersion);
    }, 10000);

});