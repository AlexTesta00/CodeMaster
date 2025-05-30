import { CodeQuest } from '../domain/codequest/codequest'
import { Problem } from '../domain/codequest/problem'
import { Language } from '../domain/language/language'
import { Difficulty } from '../domain/codequest/difficulty'

export interface CodeQuestService {
  addCodeQuest(
    title: string,
    author: string,
    problem: Problem,
    timestamp: Date | null,
    languages: Language[],
    difficulty: Difficulty
  ): Promise<CodeQuest>
  getCodeQuests(): Promise<CodeQuest[]>
  getCodeQuestById(questId: string): Promise<CodeQuest>
  getCodeQuestsByAuthor(author: string): Promise<CodeQuest[]>
  getCodeQuestsByLanguage(
    languageName: string,
    version: string,
    fileExtension: string
  ): Promise<CodeQuest[]>
  getCodeQuestsByDifficulty(difficulty: string): Promise<CodeQuest[]>
  updateDifficulty(questId: string, difficulty: Difficulty): Promise<CodeQuest>
  updateProblem(questId: string, newProblem: Problem): Promise<CodeQuest>
  updateTitle(questId: string, newTitle: string): Promise<CodeQuest>
  updateLanguages(questId: string, newLanguages: Language[]): Promise<CodeQuest>
  delete(questId: string): Promise<CodeQuest>
}

export class CodeQuestServiceError {
  static LanguageNotFound = class extends Error {}
  static InvalidCodeQuestId = class extends Error {}
  static LanguageVersionNotFound = class extends Error {}
  static CodeQuestNotFound = class extends Error {}
}
