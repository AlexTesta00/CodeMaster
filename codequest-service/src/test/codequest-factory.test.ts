import { CodeQuestError, CodeQuestFactory } from "../main/nodejs/codemaster/servicies/codequest/domain/codequest/codequest-factory";
import mongoose from "mongoose";
import { LanguageFactory } from "../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory";
import { Problem } from "../main/nodejs/codemaster/servicies/codequest/domain/codequest/problem";
import { Example } from "../main/nodejs/codemaster/servicies/codequest/domain/codequest/example";
import { languageSchema } from "../main/nodejs/codemaster/servicies/codequest/domain/language/language-model";

describe('TestCodeQuestFactory', () => {

    const author = 'example';
    const problem = new Problem("Given two lists, sum all elements in a new list", [new Example('l1 = [2,4,3], l2 = [5,6,4]', '[7,0,8]', '342 + 465 = 807')], null);
    const title = 'Calculator';
    const id = new mongoose.Types.ObjectId().toString();
    const timestamp = new Date(Date.now());
    const languages = [LanguageFactory.createLanguage("Java", ["17", "21"]), LanguageFactory.createLanguage("Scala", ["3.3", "3.4"])]

    it('should create codequest with correct values', async () => {
        const codequest = CodeQuestFactory.createCodeQuest(id, title, author, problem, timestamp, languages);
        expect(codequest.id).toBe(id);
        expect(codequest.author).toBe(author);
        expect(codequest.problem).toBe(problem);
        expect(codequest.title).toBe(title);
        expect(codequest.timestamp).toBe(timestamp);
        expect(codequest.languages).toBe(languages);
    }, 10000);

    it('should throw error when create codequest if problem\'s body is is empty', async () => {    
        const emptyProblem = new Problem("", [new Example('l1 = [2,4,3], l2 = [5,6,4]', '[7,0,8]', '342 + 465 = 807')], null);
        expect(() => {CodeQuestFactory.createCodeQuest(id, title, author, emptyProblem, timestamp, languages)}).toThrow(CodeQuestError.InvalidProblem);
    }, 10000);

    it('should throw error when create codequest if problem\' examples is empty', async () => {    
        const noExamples = new Problem("Given two lists, sum all elements in a new list", [], null);
        expect(() => {CodeQuestFactory.createCodeQuest(id, title, author, noExamples, timestamp, languages)}).toThrow(CodeQuestError.InvalidProblem);
    }, 10000);

    it('should throw error when create codequest if author\'s nickname is empty', async () => {
        expect(() => {CodeQuestFactory.createCodeQuest(id, title, "", problem, timestamp, languages)}).toThrow(CodeQuestError.InvalidAuthor);
    }, 10000);

    it('should throw error when create codequest if title is empty', async () => {
        expect(() => {CodeQuestFactory.createCodeQuest(id, "", author, problem, timestamp, languages)}).toThrow(CodeQuestError.InvalidTitle);
    }, 10000);

});