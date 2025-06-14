import mongoose from 'mongoose'
import { CodeQuest } from '../domain/codequest/codequest'
import { CodeQuestFactory } from '../domain/codequest/codequest-factory'
import { Problem } from '../domain/codequest/problem'
import { Language } from '../domain/language/language'
import { CodeQuestRepositoryImpl } from '../infrastructure/codequest/codequest-repository-impl'
import { LanguageRepositoryImpl } from '../infrastructure/language/language-repository-impl'
import { CodeQuestService, CodeQuestServiceError } from './codequest-service'
import { Difficulty } from '../domain/codequest/difficulty'
import { CodequestDeletedEvent } from '../domain/events/codequest-deleted'
import { MongoConnector } from '../infrastructure/db-connection'
import { Publisher } from '../infrastructure/middleware/publisher'

export class CodeQuestServiceImpl implements CodeQuestService {
  private languageRepo = new LanguageRepositoryImpl()
  private codequestRepo = new CodeQuestRepositoryImpl()

  constructor(private readonly publisher: Publisher) {}

  async addCodeQuest(
    title: string,
    author: string,
    problem: Problem,
    timestamp: Date | null,
    languages: Language[],
    difficulty: Difficulty
  ): Promise<CodeQuest> {
    if (languages != null) {
      for (const lang of languages) {
        await this.#languageAvailable(lang.name)
      }
    }
    const newCodequest = CodeQuestFactory.newCodeQuest(
      new mongoose.Types.ObjectId().toString(),
      title,
      author,
      problem,
      timestamp,
      languages,
      difficulty
    )
    return await this.codequestRepo.save(newCodequest)
  }

  async getCodeQuests(): Promise<CodeQuest[]> {
    try {
      return await this.codequestRepo.getAllCodeQuests()
    } catch {
      throw new CodeQuestServiceError.CodeQuestNotFound('No codequests found in database')
    }
  }

  async getCodeQuestById(questId: string): Promise<CodeQuest> {
    try {
      return await this.codequestRepo.findCodeQuestById(questId)
    } catch {
      throw new CodeQuestServiceError.InvalidCodeQuestId(
        'No codequest found with id: ' + questId
      )
    }
  }

  async getCodeQuestsByAuthor(author: string): Promise<CodeQuest[]> {
    try {
      return await this.codequestRepo.findCodeQuestsByAuthor(author)
    } catch {
      throw new CodeQuestServiceError.CodeQuestNotFound(
        'User with username "' + author + '" does not exist'
      )
    }
  }

  async getCodeQuestsByDifficulty(difficulty: string): Promise<CodeQuest[]> {
    try {
      return await this.codequestRepo.findCodeQuestsByDifficulty(difficulty)
    } catch {
      throw new CodeQuestServiceError.CodeQuestNotFound(
        'CodeQuests with difficulty "' + difficulty + '" does not exist'
      )
    }
  }

  async getCodeQuestsByLanguage(languageName: string): Promise<CodeQuest[]> {
    const language = await this.#languageAvailable(languageName)
    try {
      return await this.codequestRepo.findCodeQuestsByLanguage(language.name)
    } catch {
      throw new CodeQuestServiceError.CodeQuestNotFound(
        'No codequest solvable with "' + language.name + '" language found'
      )
    }
  }

  async updateDifficulty(questId: string, newDifficulty: Difficulty): Promise<CodeQuest> {
    try {
      return await this.codequestRepo.updateDifficulty(questId, newDifficulty)
    } catch {
      throw new CodeQuestServiceError.CodeQuestNotFound(
        'No codequest found with given id'
      )
    }
  }

  async updateProblem(questId: string, newProblem: Problem): Promise<CodeQuest> {
    try {
      return await this.codequestRepo.updateProblem(questId, newProblem)
    } catch {
      throw new CodeQuestServiceError.CodeQuestNotFound(
        'No codequest found with given id'
      )
    }
  }

  async updateTitle(questId: string, newTitle: string): Promise<CodeQuest> {
    try {
      return await this.codequestRepo.updateTitle(questId, newTitle)
    } catch {
      throw new CodeQuestServiceError.CodeQuestNotFound(
        'No codequest found with given id'
      )
    }
  }

  async updateLanguages(questId: string, newLanguages: Language[]): Promise<CodeQuest> {
    for (const lang of newLanguages) {
      await this.#languageAvailable(lang.name)
    }
    try {
      return await this.codequestRepo.updateLanguages(questId, newLanguages)
    } catch {
      throw new CodeQuestServiceError.CodeQuestNotFound(
        'No codequest found with given id'
      )
    }
  }

  async deleteAllCodequestsByAuthor(author: string): Promise<CodeQuest[]> {
    try {
      const codequests = await this.codequestRepo.deleteAllCodequestByAuthor(author)
      await Promise.all(
        codequests.map((codequest) => {
          const event = new CodequestDeletedEvent(codequest.id)
          return this.publisher.publish('codequest.deleted', event)
        })
      )
      return codequests
    } catch {
      throw new CodeQuestServiceError.AuthorNotFound(
        `No codequest created by ${author} found`
      )
    }
  }

  async delete(questId: string): Promise<CodeQuest> {
    try {
      const event = new CodequestDeletedEvent(questId)
      await this.publisher.publish('codequest.deleted', event)
      return await this.codequestRepo.delete(questId)
    } catch {
      throw new CodeQuestServiceError.CodeQuestNotFound(
        'No codequest found with given id'
      )
    }
  }

  async populateLanguages() {
    await this.languageRepo.insertAllLanguages()
  }

  isServiceReady() {
    const mongoReady = MongoConnector.isDatabaseConnected()
    const rabbitReady = this.publisher.isConnected()
    return mongoReady && rabbitReady
  }

  #languageAvailable = async (language: string): Promise<Language> => {
    return await this.languageRepo.findLanguage(language).catch(() => {
      throw new CodeQuestServiceError.LanguageNotFound('This language is not available')
    })
  }
}
