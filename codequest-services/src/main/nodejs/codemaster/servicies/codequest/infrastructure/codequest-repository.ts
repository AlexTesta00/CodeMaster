import { CodeQuest } from "../domain/codequest";

export interface CodeQuestRepository {
    save(codequest: CodeQuest): Promise<void>;
    findCodeQuestById(id: String): Promise<CodeQuest>;
    findCodeQuestsByAuthor(author: String): Promise<CodeQuest[]>;
    update(codequest: CodeQuest): Promise<void>;
    delete(id: String): Promise<void>;
}