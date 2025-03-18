import { CodeQuest } from "../../domain/codequest/codequest";
import { Language } from "../../domain/language/language";

export interface CodeQuestRepository {
    save(codequest: CodeQuest): Promise<CodeQuest>;
    getAllCodeQuests(): Promise<CodeQuest[]>;
    findCodeQuestById(questId: String): Promise<CodeQuest>;
    findCodeQuestsByAuthor(author: String): Promise<CodeQuest[]>;
    findCodeQuestsByLanguage(languageName: String, versions: String[]): Promise<CodeQuest[]>;
    updateProblem(questId: String, newProblem: String): Promise<void>;
    updateTitle(questId: String, newTitle: String): Promise<void>;
    delete(questId: String): Promise<void>;
}