import mongoose from 'mongoose';
import { CodeQuest } from "../main/nodejs/codemaster/servicies/codequest/domain/codequest/codequest";
import { CodeQuestFactory } from "../main/nodejs/codemaster/servicies/codequest/domain/codequest/codequest-factory";
import { CodeQuestModel } from "../main/nodejs/codemaster/servicies/codequest/domain/codequest/codequest-model";
import { CodeQuestRepositoryImpl } from "../main/nodejs/codemaster/servicies/codequest/infrastructure/codequest/codequest-repository-impl";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CodeQuestRepository } from '../main/nodejs/codemaster/servicies/codequest/infrastructure/codequest/codequest-repository';
import { LanguageFactory } from '../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory';
import { Problem } from '../main/nodejs/codemaster/servicies/codequest/domain/codequest/problem';
import { Example } from '../main/nodejs/codemaster/servicies/codequest/domain/codequest/example';

describe('TestCodeQuestRepository', () => {

    let mongoServer: MongoMemoryServer;
    let codequestRepo: CodeQuestRepository;
    const author = 'exampleName';
    const problem = new Problem("Given two lists, sum all elements in a new list", [new Example('l1 = [2,4,3], l2 = [5,6,4]', '[7,0,8]', '342 + 465 = 807')], null);
    const title = 'Sum of numbers in a list';
    const languages = [LanguageFactory.createLanguage("Java", ["17", "21"]), LanguageFactory.createLanguage("Scala", ["3.3", "3.4"])]
    const firstCodequest: CodeQuest = CodeQuestFactory.createCodeQuest(new mongoose.Types.ObjectId().toString(), title, author, problem, null, languages);
    const secondCodequest: CodeQuest = CodeQuestFactory.createCodeQuest(new mongoose.Types.ObjectId().toString(), title, author, problem, null, languages);

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        codequestRepo = new CodeQuestRepositoryImpl();
    }, 10000);

    beforeEach(async () => {
        await codequestRepo.save(firstCodequest);
        await codequestRepo.save(secondCodequest);
    }, 10000);

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    }, 10000);

    afterEach(async () => {
        await CodeQuestModel.deleteMany({});
    }, 10000);

    describe('Test codequest creation', () => {

        it('should create codequest with correct values', async () => {
            const foundCodeQuest = await codequestRepo.findCodeQuestById(firstCodequest.id);
            expect(foundCodeQuest).not.toBeNull();
            expect(foundCodeQuest?.problem.body).toBe(problem.body);
            expect(foundCodeQuest?.problem.examples.map(ex => new Example(ex.input, ex.output, ex.explanation!))).toEqual(problem.examples);
            expect(foundCodeQuest?.problem.constraints).toEqual(problem.constraints);
            expect(foundCodeQuest?.title).toBe(title);
            expect(foundCodeQuest?.author).toBe(author);
            expect(foundCodeQuest?.languages.map(langDoc => LanguageFactory.createLanguage(langDoc.name, langDoc.versions))).toEqual(languages);
        }, 10000);

        it('should return all codequests published from the same author', async () => {
            const codequests = await codequestRepo.findCodeQuestsByAuthor(author);
            expect(codequests[0]).toStrictEqual(firstCodequest);
            expect(codequests[1]).toStrictEqual(secondCodequest);
        }, 10000);

        it('should return all codequests created', async () => {
            const codequests = await codequestRepo.getAllCodeQuests();
            expect(codequests.length).toBe(2);
        }, 10000)

        it('should return all codequests resolvable with given language', async () => {
            const codequests = await codequestRepo.findCodeQuestsByLanguage(languages[0].name, languages[0].versions);
            expect(codequests.length).toBe(2);
            expect(codequests[0]).toStrictEqual(firstCodequest);
            expect(codequests[1]).toStrictEqual(secondCodequest);
        })
    });

    describe('Test codequest update', () => {

        it('should update the problem of the codequest as expected', async () => {
            const newCodequest = firstCodequest;
            const newProblem = new Problem("Given three lists, sum all elements as a number",
                [new Example('l1 = [2,4,3], l2 = [5,6,4], l3 = [1,2,3]', '[9,3,0]', '342 + 465 + 123 = 930')],
                 null);
            newCodequest.problem = newProblem
            await codequestRepo.updateProblem(firstCodequest.id, newProblem);
            const updatedCodequest = await codequestRepo.findCodeQuestById(firstCodequest.id);
            expect(updatedCodequest).toStrictEqual(newCodequest);
        }, 10000);
    
        it('should update the title of the codequest as expected', async () => {
            const newCodequest = firstCodequest;
            newCodequest.title = "New Title";
            await codequestRepo.updateTitle(firstCodequest.id, "New Title");
            const updatedCodequest = await codequestRepo.findCodeQuestById(firstCodequest.id);
            expect(updatedCodequest).toStrictEqual(newCodequest);
        }, 10000);
    })

    describe('Test codequest removal', () => {

        it('should delete the codequest succesfully', async () => {
            await codequestRepo.delete(firstCodequest.id);
            expect(await CodeQuestModel.findOne({ questId: firstCodequest.id }).exec()).toBeNull();
        }, 10000);
    });
});