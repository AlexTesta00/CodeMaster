import { CodeQuest } from "../domain/codequest";
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
    async findCodeQuestById(id: String): Promise<void | CodeQuest> {
        const codequestProm = CodeQuestModel.findById({ id: id }).exec();
        return await codequestProm.then(ris => {
                            new CodeQuest(ris?.id, ris!.title, ris!.author, ris!.problem, ris!.timestamp);
                        });
    }
    async findCodeQuestsByAuthor(author: String): Promise<void | [CodeQuest]> {
        const codequestProm = CodeQuestModel.find({ author: author }).exec();
        return await codequestProm.then(list => {
            list.map(codequest => new CodeQuest(codequest?.id, codequest!.title, codequest!.author, codequest!.problem, codequest!.timestamp));
        });
    }
    async modify(codequest: CodeQuest): Promise<void | CodeQuest> {
        const codequestProm = CodeQuestModel.findByIdAndUpdate({ id: codequest.id }, new CodeQuestModel({
            id: codequest.id,
            author: codequest.author,
            problem: codequest.problem,
            title: codequest.title,
            timestamp: codequest.timestamp
        })).exec();
        return await codequestProm.then(ris => {
                            new CodeQuest(ris?.id, ris!.title, ris!.author, ris!.problem, ris!.timestamp);
                        });
    }
    delete(id: String): Promise<void> {
        throw new Error("Method not implemented.");
    }

}