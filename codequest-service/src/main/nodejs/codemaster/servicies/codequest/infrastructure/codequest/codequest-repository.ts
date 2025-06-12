import { CodeQuest } from '../../domain/codequest/codequest'
import { Problem } from '../../domain/codequest/problem'
import { Language } from '../../domain/language/language'
import { Difficulty } from '../../domain/codequest/difficulty'

export interface CodeQuestRepository {
  save(codequest: CodeQuest): Promise<CodeQuest>
  getAllCodeQuests(): Promise<CodeQuest[]>
  findCodeQuestById(questId: string): Promise<CodeQuest>
  findCodeQuestsByAuthor(author: string): Promise<CodeQuest[]>
  findCodeQuestsByLanguage(languageName: string): Promise<CodeQuest[]>
  findCodeQuestsByDifficulty(difficulty: string): Promise<CodeQuest[]>
  updateProblem(questId: string, newProblem: Problem): Promise<CodeQuest>
  updateTitle(questId: string, newTitle: string): Promise<CodeQuest>
  updateLanguages(questId: string, newLanguages: Language[]): Promise<CodeQuest>
  updateDifficulty(questId: string, difficulty: Difficulty): Promise<CodeQuest>
  deleteAllCodequestByAuthor(author: string): Promise<CodeQuest[]>
  delete(questId: string): Promise<CodeQuest>
}
