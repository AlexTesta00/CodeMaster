import { CodeQuest } from '../../domain/codequest/codequest'
import { Problem } from '../../domain/codequest/problem'
import { Language } from '../../domain/language/language'

export interface CodeQuestRepository {
  save(codequest: CodeQuest): Promise<CodeQuest>
  getAllCodeQuests(): Promise<CodeQuest[]>
  findCodeQuestById(questId: string): Promise<CodeQuest>
  findCodeQuestsByAuthor(author: string): Promise<CodeQuest[]>
  findCodeQuestsByLanguage(languageName: string): Promise<CodeQuest[]>
  updateProblem(questId: string, newProblem: Problem): Promise<void>
  updateTitle(questId: string, newTitle: string): Promise<void>
  updateLanguages(questId: string, newLanguages: Language[]): Promise<void>
  delete(questId: string): Promise<void>
}
