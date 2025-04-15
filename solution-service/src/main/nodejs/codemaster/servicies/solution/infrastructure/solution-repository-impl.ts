import { SolutionRepository } from './solution-repository'
import { Solution } from '../domain/solution'
import { Language } from '../domain/language'
import { SolutionModel } from './solution-model'
import { SolutionFactory } from '../domain/solution-factory'
import mongoose from 'mongoose'

export class SolutionRepositoryImpl implements SolutionRepository {

  async addNewSolution(newSolution: Solution): Promise<Solution> {
    const solutionDoc = await new SolutionModel({
      _id: newSolution.id,
      codequest: newSolution.codequest,
      author: newSolution.author,
      language: newSolution.language,
      content: newSolution.content,
      fileEncoding: newSolution.fileEncoding,
      result: newSolution.result
    }).save()

    return SolutionFactory.newSolution(
      solutionDoc._id,
      solutionDoc.content,
      mongoose.Types.ObjectId.createFromHexString(solutionDoc.codequest),
      solutionDoc.author,
      solutionDoc.language,
      solutionDoc.fileEncoding,
      solutionDoc.result
    )
  }

  async findSolutionById(id: mongoose.Types.ObjectId): Promise<Solution> {
    const solutionDoc = await SolutionModel.findOne({ _id: id.toString() }).orFail()

    return SolutionFactory.newSolution(
      solutionDoc._id,
      solutionDoc.content,
      mongoose.Types.ObjectId.createFromHexString(solutionDoc.codequest),
      solutionDoc.author,
      solutionDoc.language,
      solutionDoc.fileEncoding,
      solutionDoc.result
    )
  }

  async removeSolution(id: mongoose.Types.ObjectId): Promise<void> {
    await SolutionModel.findOneAndDelete({ _id: id.toString() }).orFail()
  }

  async updateContent(id: mongoose.Types.ObjectId, newContent: string): Promise<void> {
    await SolutionModel.findOneAndUpdate({ _id: id }, { content: newContent })
  }

  async updateLanguage(id: mongoose.Types.ObjectId, newLanguage: Language): Promise<void> {
    await SolutionModel.findOneAndUpdate({ _id: id }, { language: newLanguage })
  }

  async updateResult(id: mongoose.Types.ObjectId, newResult: any): Promise<void> {
    await SolutionModel.findOneAndUpdate({ _id: id }, { result: newResult })
  }

}