import { MongoMemoryServer } from "mongodb-memory-server";
import { LanguageRepository } from "../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/language-repository";
import { LanguageRepositoryImpl } from "../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/language-repository-impl";
import mongoose from "mongoose";
import { LanguageModel } from "../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/language-model";
import { LanguageFactory } from "../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory";
import * as languages from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/languages.json';

describe('TestLanguageRepository', () => {    
    let mongoServer: MongoMemoryServer;
    let languageRepo: LanguageRepository;

    let exampleLanguage = LanguageFactory.createLanguage("Java", ["11","17","21"]); 
    let javaVersions = ["8", "11", "17", "21"];
    let allLanguages = Array.from(Array(languages.length).keys()).map(i => languages[i]);
    
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        languageRepo = new LanguageRepositoryImpl();
    }, 10000);

    beforeEach(async () => {
        await languageRepo.saveAllAvailableLanguage();
    }, 10000);

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    }, 10000);

    afterEach(async () => {
        await LanguageModel.deleteMany({});
    }, 10000);

    it('should get all available languages', async () => {
        const languageDocs = await languageRepo.getAllLanguages();
        expect(languageDocs).toEqual(allLanguages);
    }, 10000)
    
    it('should return a specific language', async () => {
        const languageDoc = await languageRepo.findLanguage(exampleLanguage.name);
        expect(languageDoc.name).toBe(exampleLanguage.name);
        expect(languageDoc.versions).toEqual(javaVersions);
    }, 10000)

});