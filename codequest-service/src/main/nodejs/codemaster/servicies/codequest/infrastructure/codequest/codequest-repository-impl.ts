import { CodeQuest } from '../../domain/codequest/codequest'
import { CodeQuestFactory } from '../../domain/codequest/codequest-factory'
import { CodeQuestModel } from './codequest-model'
import { Example } from '../../domain/codequest/example'
import { Problem } from '../../domain/codequest/problem'
import { Language } from '../../domain/language/language'
import { LanguageFactory } from '../../domain/language/language-factory'
import { CodeQuestRepository } from './codequest-repository'
import { Difficulty } from '../../domain/codequest/difficulty'

export class CodeQuestRepositoryImpl implements CodeQuestRepository {

  private buildCodeQuest(codequestDoc: any): CodeQuest {
    const examples = codequestDoc.problem.examples.map(
      (ex: Example) => new Example(ex.input, ex.output, ex.explanation!)
    )

    const problem = new Problem(
      codequestDoc.problem.description,
      examples,
      codequestDoc.problem.constraints
    )

    const languages = codequestDoc.languages.map((lang: Language) =>
      LanguageFactory.newLanguage(lang.name, lang.version)
    )

    return CodeQuestFactory.newCodeQuest(
      codequestDoc.questId,
      codequestDoc.title,
      codequestDoc.author,
      problem,
      codequestDoc.timestamp,
      languages,
      Difficulty.from(codequestDoc.difficulty.name)
    )
  }

  async save(codequest: CodeQuest): Promise<CodeQuest> {
    const codequestDoc = await new CodeQuestModel({
      questId: codequest.id,
      author: codequest.author,
      problem: codequest.problem,
      title: codequest.title,
      timestamp: codequest.timestamp,
      languages: codequest.languages,
      difficulty: codequest.difficulty
    }).save()

    return this.buildCodeQuest(codequestDoc)
  }

  async getAllCodeQuests(): Promise<CodeQuest[]> {
    const codequestDocs = await CodeQuestModel.find({})

    return codequestDocs.map((codequestDoc) => this.buildCodeQuest(codequestDoc))
  }

  async findCodeQuestById(questId: string): Promise<CodeQuest> {
    const codequestDoc = await CodeQuestModel.findOne({ questId }).orFail()

    const examples = codequestDoc.problem.examples.map(
      (ex) => new Example(ex.input, ex.output, ex.explanation!)
    )
    const problem = new Problem(
      codequestDoc.problem.description,
      examples,
      codequestDoc.problem.constraints
    )

    return this.buildCodeQuest(codequestDoc)
  }

  async findCodeQuestsByAuthor(authorName: string): Promise<CodeQuest[]> {
    const codequestDocs = await CodeQuestModel.find({ author: authorName })

    return codequestDocs.map((codequestDoc) => this.buildCodeQuest(codequestDoc))
  }

  async findCodeQuestsByLanguage(languageName: string): Promise<CodeQuest[]> {
    const codequestDocs = await CodeQuestModel.find({
      languages: { $elemMatch: { name: languageName } },
    })

    return codequestDocs.map((codequestDoc) => this.buildCodeQuest(codequestDoc))
  }

  async findCodeQuestsByDifficulty(difficulty: string): Promise<CodeQuest[]> {
    const codequestDocs = await CodeQuestModel.find({
      'difficulty.name': difficulty,
    })

    return codequestDocs.map((codequestDoc) => this.buildCodeQuest(codequestDoc))
  }

  async updateProblem(questId: string, newProblem: Problem): Promise<CodeQuest> {
    await CodeQuestModel.findOneAndUpdate(
      { questId },
      { problem: newProblem }
    ).orFail()
    const codequestDoc = await CodeQuestModel.findOne({ questId }).orFail()
    return this.buildCodeQuest(codequestDoc)
  }

  async updateTitle(questId: string, newTitle: string): Promise<CodeQuest> {
    await CodeQuestModel.findOneAndUpdate(
      { questId },
      { title: newTitle }
    ).orFail()
    const codequestDoc = await CodeQuestModel.findOne({ questId }).orFail()
    return this.buildCodeQuest(codequestDoc)
  }

  async updateLanguages(questId: string, newLanguages: Language[]): Promise<CodeQuest> {
    await CodeQuestModel.findOneAndUpdate(
      { questId },
      { languages: newLanguages }
    ).orFail()
    const codequestDoc = await CodeQuestModel.findOne({ questId }).orFail()
    return this.buildCodeQuest(codequestDoc)
  }

  async updateDifficulty(questId: string, newDifficulty: Difficulty): Promise<CodeQuest> {
    await CodeQuestModel.findOneAndUpdate(
      { questId },
      { difficulty: newDifficulty }
    ).orFail()
    const codequestDoc = await CodeQuestModel.findOne({ questId }).orFail()
    return this.buildCodeQuest(codequestDoc)
  }

  async delete(questId: string): Promise<CodeQuest> {
    const codequestDoc = await CodeQuestModel.findOneAndDelete(
      { questId }
    ).orFail()
    return this.buildCodeQuest(codequestDoc)
  }
}
