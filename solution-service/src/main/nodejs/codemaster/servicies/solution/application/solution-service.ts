import { Language } from '../domain/language'
import { Solution } from '../domain/solution'
import mongoose from 'mongoose'

export interface SolutionService {
  addSolution(
    code: string,
    codequest: mongoose.Types.ObjectId,
    author: string,
    language: Language,
    fileEncoding: string,
    result: any
  ): Promise<Solution>
  getSolutionById(id: mongoose.Types.ObjectId): Promise<Solution>
  modifySolutionCode(id: mongoose.Types.ObjectId, code: string): Promise<void>
  modifySolutionLanguage(id: mongoose.Types.ObjectId, language: Language): Promise<void>
  executeCode(id: mongoose.Types.ObjectId): Promise<any>
}

export class SolutionServiceError {
  static SolutionNotFound = class extends Error {}
}