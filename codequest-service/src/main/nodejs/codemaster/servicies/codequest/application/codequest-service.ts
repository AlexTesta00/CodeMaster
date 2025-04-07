import { CodeQuest } from '../domain/codequest/codequest'
import { Problem } from '../domain/codequest/problem'
import { Language } from '../domain/language/language'

export interface CodeQuestService {
  addCodeQuest(
    title: string,
    author: string,
    problem: Problem,
    timestamp: Date | null,
    languages: Language[]
  ): Promise<CodeQuest>
  getCodeQuests(): Promise<CodeQuest[]>
  getCodeQuestById(questId: string): Promise<CodeQuest>
  getCodeQuestsByAuthor(author: string): Promise<CodeQuest[]>
  getCodeQuestsByLanguage(languageName: string, versions: string[]): Promise<CodeQuest[]>
  updateProblem(questId: string, newProblem: Problem): Promise<void>
  updateTitle(questId: string, newTitle: string): Promise<void>
  updateLanguages(questId: string, newLanguages: Language[]): Promise<void>
  delete(questId: string): Promise<void>
}

export class CodeQuestServiceError {
  static LanguageNotFound = class extends Error {}
  static InvalidCodeQuestId = class extends Error {}
  static LanguageVersionNotFound = class extends Error {}
  static CodeQuestNotFound = class extends Error {}
}
