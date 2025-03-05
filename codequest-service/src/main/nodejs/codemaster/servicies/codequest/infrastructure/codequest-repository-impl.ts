import { CodeQuest } from "../domain/codequest";
import { CodeQuestFactory } from "../domain/codequest-factory";
import { CodeQuestModel } from "../domain/codequest-model";
import { CodeQuestRepository } from "./codequest-repository";

export class CodeQuestRepositoryImpl implements CodeQuestRepository{
    async save(codequest: CodeQuest): Promise<void> {
        const codequestDoc = new CodeQuestModel({
            questId: codequest.id,
            author: codequest.author,
            problem: codequest.problem,
            title: codequest.title,
            timestamp: codequest.timestamp
        })
    
        await codequestDoc.save();
    }
    async getAllCodeQuests(): Promise<CodeQuest[]> {
        const codequestDocs = await CodeQuestModel.find({}).orFail();
        return codequestDocs.map(codequestDoc => CodeQuestFactory.createCodeQuest(codequestDoc.questId, codequestDoc.title, codequestDoc.author, codequestDoc.problem, codequestDoc.timestamp));
    }
    async findCodeQuestById(questId: String): Promise<CodeQuest> {
        const codequestDoc = await CodeQuestModel.findOne({ questId }).orFail();
        return CodeQuestFactory.createCodeQuest(codequestDoc.questId, codequestDoc.title, codequestDoc.author, codequestDoc.problem, codequestDoc.timestamp);
    }
    async findCodeQuestsByAuthor(authorName: String): Promise<CodeQuest[]> {
        const codequestDocs = await CodeQuestModel.find({ author: authorName }).orFail();
        return codequestDocs.map(codequestDoc => CodeQuestFactory.createCodeQuest(codequestDoc.questId, codequestDoc.title, codequestDoc.author, codequestDoc.problem, codequestDoc.timestamp));
    }
    async updateProblem(questId: String, newProblem: String): Promise<void> {
        await CodeQuestModel.findOneAndUpdate({ questId }, { problem: newProblem }).orFail();
    }
    async updateTitle(questId: String, newTitle: String): Promise<void> {
        await CodeQuestModel.findOneAndUpdate({ questId }, { title: newTitle }).orFail();
    }
    async delete(questId: String): Promise<void> {
        await CodeQuestModel.findOneAndDelete({ questId }).orFail();
    }

}