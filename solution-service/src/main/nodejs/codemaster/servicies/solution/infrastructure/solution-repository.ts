import { Solution } from '../domain/solution'
import mongoose from 'mongoose'
import { Language } from '../domain/language'

export interface SolutionRepository{
  addNewSolution(newSolution: Solution): Promise<Solution>
  findSolutionById(id: mongoose.Types.ObjectId): Promise<Solution>
  updateLanguage(id: mongoose.Types.ObjectId, newLanguage: Language): Promise<void>
  updateResult(id: mongoose.Types.ObjectId, newResult: any): Promise<void>
  updateCode(id: mongoose.Types.ObjectId, newCode: string): Promise<void>
  removeSolution(id: mongoose.Types.ObjectId): Promise<void>
}