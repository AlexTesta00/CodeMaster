import { CodeQuest } from "../domain/codequest";
import { CodeQuestFactory } from "../domain/codequest-factory";
import { CodeQuestModel } from "../domain/codequest-model";
import { CodeQuestRepository } from "./codequest-repository";

export class CodeQuestRepositoryImpl implements CodeQuestRepository{
    async save(codequest: CodeQuest): Promise<void> {
        const codequestDoc = new CodeQuestModel({
            id: codequest.id,
            author: codequest.author,
            problem: codequest.problem,
            title: codequest.title,
            timestamp: codequest.timestamp
        })
    
        await codequestDoc.save();
    }
    async findCodeQuestById(id: String): Promise<CodeQuest> {
        const codequestDoc = await CodeQuestModel.findById({ id: id }).orFail();
        return CodeQuestFactory.createCodeQuest(codequestDoc.id, codequestDoc.title, codequestDoc.author, codequestDoc.problem, codequestDoc.timestamp);
    }
    async findCodeQuestsByAuthor(author: String): Promise<CodeQuest[]> {
        const codequestDocs = await CodeQuestModel.find({ author: author }).orFail();
        return codequestDocs.map(codequest => CodeQuestFactory.createCodeQuest(codequest?.id, codequest!.title, codequest!.author, codequest!.problem, codequest!.timestamp));
    }
    async update(codequest: CodeQuest): Promise<void> {
        const codequestDoc = await CodeQuestModel.findByIdAndUpdate({ id: codequest.id }, new CodeQuestModel({
            author: codequest.author,
            problem: codequest.problem,
            title: codequest.title,
            timestamp: codequest.timestamp
        })).orFail();
        await codequestDoc.save();
    }
    async delete(id: String): Promise<void> {
        await CodeQuestModel.deleteOne({ id: id }).orFail();
    }

}