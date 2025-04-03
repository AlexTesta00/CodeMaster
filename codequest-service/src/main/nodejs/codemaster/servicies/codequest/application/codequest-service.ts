import { CodeQuest } from "../domain/codequest/codequest"
import { Problem } from "../domain/codequest/problem"
import { Language } from "../domain/language/language"

export interface CodeQuestService {
  addCodeQuest(title: String, author: String, problem: Problem, timestamp: Date | null, languages: Language[]): Promise<CodeQuest>
  getCodeQuests(): Promise<CodeQuest[]>;
  getCodeQuestById(questId: String): Promise<CodeQuest>;
  getCodeQuestsByAuthor(author: String): Promise<CodeQuest[]>;
  getCodeQuestsByLanguage(languageName: String, versions: String[]): Promise<CodeQuest[]>;
  updateProblem(questId: String, newProblem: Problem): Promise<void>;
  updateTitle(questId: String, newTitle: String): Promise<void>;
  updateLanguages(questId: String, newLanguages: Language[]): Promise<void>;
  delete(questId: String): Promise<void>;
}

export class CodeQuestServiceError {
  static LanguageNotFound = class extends Error {}
  static InvalidCodeQuestId = class extends Error {}
  static LanguageVersionNotFound = class extends Error {}
  static CodeQuestNotFound = class extends Error {}
}