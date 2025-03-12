import { CodeQuest } from "../../domain/codequest/codequest";

export interface CodeQuestRepository {
    save(codequest: CodeQuest): Promise<void>;
    getAllCodeQuests(): Promise<CodeQuest[]>;
    findCodeQuestById(questId: String): Promise<CodeQuest>;
    findCodeQuestsByAuthor(author: String): Promise<CodeQuest[]>;
    updateProblem(questId: String, newProblem: String): Promise<void>;
    updateTitle(questId: String, newTitle: String): Promise<void>;
    delete(questId: String): Promise<void>;
}