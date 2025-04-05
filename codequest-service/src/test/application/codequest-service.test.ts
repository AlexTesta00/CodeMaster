import { MongoMemoryServer } from "mongodb-memory-server";
import { CodeQuestServiceImpl } from "../../main/nodejs/codemaster/servicies/codequest/application/codequest-service-impl"
import mongoose from "mongoose";
import { Problem } from "../../main/nodejs/codemaster/servicies/codequest/domain/codequest/problem";
import { Example } from "../../main/nodejs/codemaster/servicies/codequest/domain/codequest/example";
import { LanguageFactory } from "../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory";
import { LanguageRepositoryImpl } from "../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/language-repository-impl";
import { CodeQuestService, CodeQuestServiceError } from "../../main/nodejs/codemaster/servicies/codequest/application/codequest-service";
import { LanguageRepository } from "../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/language-repository";
import {
    CodeQuestModel
} from "../../main/nodejs/codemaster/servicies/codequest/infrastructure/codequest/codequest-model";
import {populateLanguages} from "../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/populate";


describe('TestCodequestService', () => {
    
    let mongoServer: MongoMemoryServer
    let languageRepo: LanguageRepository;
    let service : CodeQuestService

    const timeout = 15000
    const author = 'exampleName';
    const problem = new Problem("Problem example", [new Example('example1', 'example2', 'explanation')], ['constraints']);
    const title = 'Title example';
    const languages = [LanguageFactory.newLanguage("Java", ["17", "21"]), LanguageFactory.newLanguage("Scala", ["3.3", "3.4"])]

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        languageRepo = new LanguageRepositoryImpl();
        service = new CodeQuestServiceImpl();
        await populateLanguages()
    }, timeout);

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    }, timeout);

    afterEach(async () => {
        await CodeQuestModel.deleteMany({});
    }, timeout);

    describe('TEST save new codequests', () => {

        it('should add new codequests correctly', async () => {
            const codequest = await service.addCodeQuest(title, author, problem, null, languages);

            expect(codequest).not.toBeNull();
            expect(codequest.problem.body).toBe(problem.body);
            expect(codequest.problem.examples).toEqual(problem.examples);
            expect(codequest.problem.constraints).toEqual(problem.constraints);
            expect(codequest.title).toBe(title);
            expect(codequest.author).toBe(author);
            expect(codequest.languages.map(langDoc => LanguageFactory.newLanguage(langDoc.name, langDoc.versions))).toEqual(languages);
        }, timeout)

        it('should throw error if languages does not exist in the database', async () => {
            const invalidLanguage = LanguageFactory.newLanguage("C", ["C99"])

            await expect(() => service.addCodeQuest(title, author, problem, null, [invalidLanguage])).rejects.toThrow(CodeQuestServiceError.LanguageNotFound)
        }, timeout)

        it('should throw error if language version does not exist in the database', async () => {
            const invalidLanguage = LanguageFactory.newLanguage("Java", ["1"])

            await expect(() => service.addCodeQuest(title, author, problem, null, [invalidLanguage])).rejects.toThrow(CodeQuestServiceError.LanguageVersionNotFound)
        }, timeout)
    })

    describe('TEST get codequests', () => {

        it('should retrieve all codequests', async () => {
            let codequests = []
            codequests.push(await service.addCodeQuest('Code quest 1', author, problem, null, languages));
            codequests.push(await service.addCodeQuest('Code quest 2', author, problem, null, languages));

            expect((await service.getCodeQuests()).length).toBe(codequests.length)
        }, timeout)

        it('should return an empty list if there are no codequest', async () => {
            expect(await service.getCodeQuests()).toStrictEqual([])
        }, timeout)

        it('should retrieve codequest by id', async () => {
            const newCodequest = await service.addCodeQuest(title, author, problem, null, languages)
            const foundCodequest = await service.getCodeQuestById(newCodequest.id)

            expect(foundCodequest).not.toBeNull();
            expect(foundCodequest.problem.body).toBe(newCodequest.problem.body);
            expect(foundCodequest.problem.examples.map(ex => new Example(ex.input, ex.output, ex.explanation!))).toEqual(newCodequest.problem.examples);
            expect(foundCodequest.problem.constraints).toEqual(newCodequest.problem.constraints);
            expect(foundCodequest.title).toBe(newCodequest.title);
            expect(foundCodequest.author).toBe(newCodequest.author);
            expect(foundCodequest.languages.map(langDoc => LanguageFactory.newLanguage(langDoc.name, langDoc.versions))).toEqual(languages);
        }, timeout)

        it('should throw error if there are no codequest with given id', async () => {
            await service.addCodeQuest(title, author, problem, null, languages)
            const newId = new mongoose.Types.ObjectId().toString()

            await expect(() => service.getCodeQuestById(newId)).rejects.toThrow(CodeQuestServiceError.InvalidCodeQuestId)
        },timeout)

        it('should retrieve all codequests created by a user', async () => {
            const newCodequest = await service.addCodeQuest(title, author, problem, null, languages)
            const foundCodequests = await service.getCodeQuestsByAuthor(newCodequest.author)

            foundCodequests.forEach((codequest) => {
                expect(codequest).not.toBeNull();
                expect(codequest.problem.body).toBe(newCodequest.problem.body);
                expect(codequest.problem.examples.map(ex => new Example(ex.input, ex.output, ex.explanation!))).toEqual(newCodequest.problem.examples);
                expect(codequest.problem.constraints).toEqual(newCodequest.problem.constraints);
                expect(codequest.title).toBe(newCodequest.title);
                expect(codequest.author).toBe(newCodequest.author);
                expect(codequest.languages.map(langDoc => LanguageFactory.newLanguage(langDoc.name, langDoc.versions))).toEqual(languages);
            })
        }, timeout);

        it('should retrieve all codequests with given language', async () => {
            const newCodequest = await service.addCodeQuest(title, author, problem, null, languages)
            const language = LanguageFactory.newLanguage(languages[0].name, languages[0].versions)
            const foundCodequests = await service.getCodeQuestsByLanguage(language.name, language.versions)

            foundCodequests.forEach((codequest) => {
                expect(codequest).not.toBeNull();
                expect(codequest.problem.body).toBe(newCodequest.problem.body);
                expect(codequest.problem.examples.map(ex => new Example(ex.input, ex.output, ex.explanation!))).toEqual(newCodequest.problem.examples);
                expect(codequest.problem.constraints).toEqual(newCodequest.problem.constraints);
                expect(codequest.title).toBe(newCodequest.title);
                expect(codequest.author).toBe(newCodequest.author);
                expect(codequest.languages.map(langDoc => LanguageFactory.newLanguage(langDoc.name, langDoc.versions))).toContainEqual(language);
            })
        }, timeout);

        it('should throw error if languages does not exist in the database', async () => {
            const invalidLanguage = LanguageFactory.newLanguage("C", ["C99"])

            await expect(() => service.getCodeQuestsByLanguage(invalidLanguage.name, invalidLanguage.versions)).rejects.toThrow(CodeQuestServiceError.LanguageNotFound)
        }, timeout)

        it('should throw error if language version does not exist in the database', async () => {
            const invalidLanguage = LanguageFactory.newLanguage("Java", ["1"])

            await expect(() => service.getCodeQuestsByLanguage(invalidLanguage.name, invalidLanguage.versions)).rejects.toThrow(CodeQuestServiceError.LanguageVersionNotFound)
        }, timeout)
    })

    describe('TEST update codequests', () => {

        it('should update a codequest\' problem correctly', async () => {
            const newCodequest = await service.addCodeQuest(title, author, problem, null, languages)
            const newProblem = new Problem("New Problem", [new Example("input", "output", "explanation")], null)

            await service.updateProblem(newCodequest.id, newProblem)
            const updatedCodequest = await service.getCodeQuestById(newCodequest.id)
            expect(updatedCodequest.problem.body).toBe(newProblem.body);
            expect(updatedCodequest.problem.examples.map(ex => new Example(ex.input, ex.output, ex.explanation!))).toEqual(newProblem.examples);
            expect(updatedCodequest.problem.constraints).toEqual(newProblem.constraints);
        }, timeout)

        it('should update a codequest\'s title correctly', async () => {
            const newCodequest = await service.addCodeQuest(title, author, problem, null, languages)
            const newTitle = "New Title"

            await service.updateTitle(newCodequest.id, newTitle)
            const updatedCodequest = await service.getCodeQuestById(newCodequest.id)
            expect(updatedCodequest.title).toBe(newTitle);
        }, timeout)

        it('should update a codequest\'s Languages correctly', async () => {
            const newCodequest = await service.addCodeQuest(title, author, problem, null, languages)
            const newLanguages = [LanguageFactory.newLanguage("Java", ["17", "21"])]

            await service.updateLanguages(newCodequest.id, newLanguages)
            const updatedCodequest = await service.getCodeQuestById(newCodequest.id)
            expect(updatedCodequest.languages.map(langDoc => LanguageFactory.newLanguage(langDoc.name, langDoc.versions))).toEqual(newLanguages);
        }, timeout)

        it('should throw error if the given new languages are not available', async () => {
            const newCodequest = await service.addCodeQuest(title, author, problem, null, languages)
            const newLanguages = [LanguageFactory.newLanguage("C", ["C99"])]

            await expect(() => service.updateLanguages(newCodequest.id, newLanguages)).rejects.toThrow(CodeQuestServiceError.LanguageNotFound)
        }, timeout)

        it('should throw error if the given new languages versions are not available', async () => {
            const newCodequest = await service.addCodeQuest(title, author, problem, null, languages)
            const newLanguages = [LanguageFactory.newLanguage("Java", ["1"])]

            await expect(() => service.updateLanguages(newCodequest.id, newLanguages)).rejects.toThrow(CodeQuestServiceError.LanguageVersionNotFound)
        }, timeout)

        it('should throw error if there are no codequest to update with given id', async () => {
            await service.addCodeQuest(title, author, problem, null, languages)
            const newProblem = new Problem("New Problem", [new Example("input", "output", "explanation")], null)
            const newId = new mongoose.Types.ObjectId().toString()
            const newLanguages = [LanguageFactory.newLanguage("Java", ["17", "21"])]

            await expect(() => service.updateProblem(newId, newProblem)).rejects.toThrow(CodeQuestServiceError.CodeQuestNotFound)
            await expect(() => service.updateTitle(newId, "New Title")).rejects.toThrow(CodeQuestServiceError.CodeQuestNotFound)
            await expect(() => service.updateLanguages(newId, newLanguages)).rejects.toThrow(CodeQuestServiceError.CodeQuestNotFound)
        },timeout)
    })

    describe('TEST delete codequest', () => {

        it('should delete a codequest correctly', async () => {
            const newCodequest = await service.addCodeQuest(title, author, problem, null, languages)

            await service.delete(newCodequest.id)
            await expect(() => service.getCodeQuestById(newCodequest.id)).rejects.toThrow(CodeQuestServiceError.InvalidCodeQuestId)
        }, timeout)

        it('should throw error if there are no codequest with given id', async () => {
            await service.addCodeQuest(title, author, problem, null, languages)
            const newId = new mongoose.Types.ObjectId().toString()

            await expect(() => service.delete(newId)).rejects.toThrow(CodeQuestServiceError.CodeQuestNotFound)
        }, timeout)
    })

})