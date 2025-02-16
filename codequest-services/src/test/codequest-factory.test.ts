import { CodeQuestFactory } from "../main/nodejs/codemaster/servicies/codequest/domain/codequest-factory";
import { ObjectId } from "mongodb";

describe('TestCodeQuestFactory', () => {

    const author = 'example';
    const problem = 'Realise a calculator';
    const title = 'Calculator';
    const id = new ObjectId();
    const timestamp = new Date(Date.now());

    it('should create codequest with correct values', async () => {
        const codequest = CodeQuestFactory.createCodeQuest(id.toString(), title, author, problem, timestamp);
        expect(codequest.author).toBe(author);
        expect(codequest.problem).toBe(problem);
        expect(codequest.title).toBe(title);
    }, 10000);

    it('should throw error when create codequest if problem is empty', async () => {
        expect(() => {CodeQuestFactory.createCodeQuest(id.toString(), title, author, "", timestamp)}).toThrow(new Error('Invalid problem: problem\'s body cannot be empty'));
    }, 10000);

    it('should throw error when create codequest if author\'s nickname is empty', async () => {
        expect(() => {CodeQuestFactory.createCodeQuest(id.toString(), title, "", problem, timestamp)}).toThrow(new Error('Invalid nickname: this user doesn\'t exist'));
    }, 10000);

    it('should throw error when create codequest if title is empty', async () => {
        expect(() => {CodeQuestFactory.createCodeQuest(id.toString(), "", author, problem, timestamp)}).toThrow(new Error('Invalid title: title\'s body cannot be empty'));
    }, 10000);

});