import { CodeQuest } from "../../domain/codequest/codequest";
import { Problem } from "../../domain/codequest/problem";
import { Language } from "../../domain/language/language";

export interface CodeQuestRepository {
    save(codequest: CodeQuest): Promise<CodeQuest>;
    getAllCodeQuests(): Promise<CodeQuest[]>;
    findCodeQuestById(questId: String): Promise<CodeQuest>;
    findCodeQuestsByAuthor(author: String): Promise<CodeQuest[]>;
    findCodeQuestsByLanguage(languageName: String): Promise<CodeQuest[]>;
    updateProblem(questId: String, newProblem: Problem): Promise<void>;
    updateTitle(questId: String, newTitle: String): Promise<void>;
    updateLanguages(questId: String, newLanguages: Language[]): Promise<void>;
    delete(questId: String): Promise<void>;
}