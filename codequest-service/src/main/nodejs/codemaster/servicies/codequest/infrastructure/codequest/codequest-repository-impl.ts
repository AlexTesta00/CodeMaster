import { CodeQuest } from "../../domain/codequest/codequest";
import { CodeQuestFactory } from "../../domain/codequest/codequest-factory";
import { CodeQuestModel } from "../../domain/codequest/codequest-model";
import { Example } from "../../domain/codequest/example";
import { Problem } from "../../domain/codequest/problem";
import { Language } from "../../domain/language/language";
import { LanguageFactory } from "../../domain/language/language-factory";
import { CodeQuestRepository } from "./codequest-repository";

export class CodeQuestRepositoryImpl implements CodeQuestRepository{

    async save(codequest: CodeQuest): Promise<CodeQuest> {
        const codequestDoc = await new CodeQuestModel({
            questId: codequest.id,
            author: codequest.author,
            problem: codequest.problem,
            title: codequest.title,
            timestamp: codequest.timestamp,
            languages: codequest.languages
        }).save()

        const examples = codequestDoc.problem.examples.map(ex => new Example(ex.input, ex.output, ex.explanation!));
        const problem = new Problem(codequestDoc.problem.body, examples, codequestDoc.problem.constraints)
    
        return CodeQuestFactory.newCodeQuest(codequestDoc.questId,
            codequestDoc.title, 
            codequestDoc.author, 
            problem, 
            codequestDoc.timestamp, 
            codequestDoc.languages)
    }
    async getAllCodeQuests(): Promise<CodeQuest[]> {
        const codequestDocs = await CodeQuestModel.find({}).orFail();

        return codequestDocs.map(codequestDoc => CodeQuestFactory.newCodeQuest(codequestDoc.questId,
            codequestDoc.title,
            codequestDoc.author, 
            new Problem(codequestDoc.problem.body, 
                codequestDoc.problem.examples.map(ex => new Example(ex.input, ex.output, ex.explanation!)), 
                codequestDoc.problem.constraints), 
            codequestDoc.timestamp, 
            codequestDoc.languages.map(lang => LanguageFactory.createLanguage(lang.name, lang.versions))));
    }
    async findCodeQuestById(questId: String): Promise<CodeQuest> {
        const codequestDoc = await CodeQuestModel.findOne({ questId }).orFail();

        const examples = codequestDoc.problem.examples.map(ex => new Example(ex.input, ex.output, ex.explanation!));
        const problem = new Problem(codequestDoc.problem.body, examples, codequestDoc.problem.constraints)

        return CodeQuestFactory.newCodeQuest(codequestDoc.questId,
            codequestDoc.title,
            codequestDoc.author, 
            problem, 
            codequestDoc.timestamp, 
            codequestDoc.languages.map(lang => LanguageFactory.createLanguage(lang.name, lang.versions)));
    }
    async findCodeQuestsByAuthor(authorName: String): Promise<CodeQuest[]> {
        const codequestDocs = await CodeQuestModel.find({ author: authorName }).orFail();

        return codequestDocs.map(codequestDoc => CodeQuestFactory.newCodeQuest(codequestDoc.questId,
            codequestDoc.title,
            codequestDoc.author, 
            new Problem(codequestDoc.problem.body, 
                codequestDoc.problem.examples.map(ex => new Example(ex.input, ex.output, ex.explanation!)), 
                codequestDoc.problem.constraints), 
            codequestDoc.timestamp, 
            codequestDoc.languages.map(lang => LanguageFactory.createLanguage(lang.name, lang.versions))));
    }
    async findCodeQuestsByLanguage(languageName: String): Promise<CodeQuest[]> {
        const codequestDocs = await CodeQuestModel.find({ languages: { $elemMatch : {name: languageName }} }).orFail();
        return codequestDocs.map(codequestDoc => CodeQuestFactory.newCodeQuest(codequestDoc.questId,
            codequestDoc.title,
            codequestDoc.author,
            new Problem(codequestDoc.problem.body,
                        codequestDoc.problem.examples.map(ex => new Example(ex.input, ex.output, ex.explanation!)),
                        codequestDoc.problem.constraints),
            codequestDoc.timestamp, 
            codequestDoc.languages.map(lang => LanguageFactory.createLanguage(lang.name, lang.versions))
        ));
    }
    async updateProblem(questId: String, newProblem: Problem): Promise<void> {
        await CodeQuestModel.findOneAndUpdate({ questId }, { problem: newProblem }).orFail();
    }
    async updateTitle(questId: String, newTitle: String): Promise<void> {
        await CodeQuestModel.findOneAndUpdate({ questId }, { title: newTitle }).orFail();
    }
    async updateLanguages(questId: String, newLanguages: Language[]): Promise<void> {
        await CodeQuestModel.findOneAndUpdate({ questId }, { languages: newLanguages }).orFail();
    }
    async delete(questId: String): Promise<void> {
        await CodeQuestModel.findOneAndDelete({ questId }).orFail();
    }

}