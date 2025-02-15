import { CodeQuest } from "../domain/codequest";

export interface CodeQuestRepository {
    save(codequest: CodeQuest): Promise<void>;
    findCodeQuestById(id: String): Promise<void | CodeQuest>;
    findCodeQuestsByAuthor(author: String): Promise<void | [CodeQuest]>;
    modify(codequest: CodeQuest): Promise<void | CodeQuest>;
    delete(id: String): Promise<void>;
}