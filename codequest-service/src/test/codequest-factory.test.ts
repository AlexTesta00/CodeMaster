import { CodeQuestFactory } from "../main/nodejs/codemaster/servicies/codequest/domain/codequest-factory";
import mongoose from "mongoose";
import { CodeQuestError } from "../main/nodejs/codemaster/servicies/codequest/domain/error/codequest-error";

describe('TestCodeQuestFactory', () => {

    const author = 'example';
    const problem = 'Realise a calculator';
    const title = 'Calculator';
    const id = new mongoose.Types.ObjectId().toString();
    const timestamp = new Date(Date.now());

    it('should create codequest with correct values', async () => {
        const codequest = CodeQuestFactory.createCodeQuest(id, title, author, problem, timestamp);
        expect(codequest.author).toBe(author);
        expect(codequest.problem).toBe(problem);
        expect(codequest.title).toBe(title);
    }, 10000);

    it('should throw error when create codequest if problem is empty', async () => {
        expect(() => {CodeQuestFactory.createCodeQuest(id, title, author, "", timestamp)}).toThrow(CodeQuestError.InvalidProblem);
    }, 10000);

    it('should throw error when create codequest if author\'s nickname is empty', async () => {
        expect(() => {CodeQuestFactory.createCodeQuest(id, title, "", problem, timestamp)}).toThrow(CodeQuestError.InvalidAuthor);
    }, 10000);

    it('should throw error when create codequest if title is empty', async () => {
        expect(() => {CodeQuestFactory.createCodeQuest(id, "", author, problem, timestamp)}).toThrow(CodeQuestError.InvalidTitle);
    }, 10000);

});