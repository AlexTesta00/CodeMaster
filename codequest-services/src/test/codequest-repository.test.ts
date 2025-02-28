import mongoose from 'mongoose';
import { MongooseError } from 'mongoose';
import { CodeQuest } from "../main/nodejs/codemaster/servicies/codequest/domain/codequest";
import { CodeQuestFactory } from "../main/nodejs/codemaster/servicies/codequest/domain/codequest-factory";
import { CodeQuestModel } from "../main/nodejs/codemaster/servicies/codequest/domain/codequest-model";
import { CodeQuestRepositoryImpl } from "../main/nodejs/codemaster/servicies/codequest/infrastructure/codequest-repository-impl";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CodeQuestRepository } from '../main/nodejs/codemaster/servicies/codequest/infrastructure/codequest-repository';
import { codequestSchema } from '../main/nodejs/codemaster/servicies/codequest/domain/codequest-model';

describe('TestCodeQuestRepository', () => {

    let mongoServer: MongoMemoryServer;
    let repository: CodeQuestRepository;
    const author = 'example';
    const problem = 'Problem';
    const title = 'Title';
    const firstCodequest: CodeQuest = CodeQuestFactory.createCodeQuest(new mongoose.Types.ObjectId().toString(), title, author, problem, new Date());
    const secondCodequest: CodeQuest = CodeQuestFactory.createCodeQuest(new mongoose.Types.ObjectId().toString(), title, author, problem, new Date());

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        mongoose.model('CodeQuest', codequestSchema);
        repository =  new CodeQuestRepositoryImpl();
    }, 10000);

    beforeEach(async () => {
        await repository.save(firstCodequest);
        await repository.save(secondCodequest);
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
            const foundCodeQuest = await CodeQuestModel.findOne({ questId: firstCodequest.id }).exec();
            expect(foundCodeQuest).not.toBeNull();
            expect(foundCodeQuest?.problem).toBe(problem);
            expect(foundCodeQuest?.title).toBe(title);
            expect(foundCodeQuest?.author).toBe(author);
        }, 10000);

        it('should return all codequests published from the same author', async () => {
            const codequests = await repository.findCodeQuestsByAuthor(author);
            expect(codequests[0]).toStrictEqual(firstCodequest);
            expect(codequests[1]).toStrictEqual(secondCodequest);
        }, 10000);

        it('should return all codequests created', async () => {
            const codequests = await repository.getAllCodeQuests();
            expect(codequests.length).toBe(2);
        }, 10000)
    });

    describe('Test codequest update', () => {

        it('should update the problem of the codequest as expected', async () => {
            const newCodequest = firstCodequest;
            newCodequest.problem = "New Problem";
            await repository.updateProblem(firstCodequest.id, "New Problem");
            const updatedCodequest = await repository.findCodeQuestById(firstCodequest.id);
            expect(updatedCodequest).toStrictEqual(newCodequest);
        }, 10000);
    
        it('should update the title of the codequest as expected', async () => {
            const newCodequest = firstCodequest;
            newCodequest.title = "New Title";
            await repository.updateTitle(firstCodequest.id, "New Title");
            const updatedCodequest = await repository.findCodeQuestById(firstCodequest.id);
            expect(updatedCodequest).toStrictEqual(newCodequest);
        }, 10000);
    })

    describe('Test codequest removal', () => {

        it('should delete the codequest succesfully', async () => {
            await repository.delete(firstCodequest.id);
            expect(await CodeQuestModel.findOne({ questId: firstCodequest.id }).exec()).toBeNull();
        }, 10000);
    });
});