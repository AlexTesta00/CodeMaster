import * as mongoose from 'mongoose'
import { Language } from './language'
import { Solution } from './solution'

export class SolutionFactory {
  static newSolution(id: mongoose.Types.ObjectId, code: string, codequest: mongoose.Types.ObjectId, author: string, language: Language, fileEncoding: string, result: any): Solution {
    if(code == '') {
      throw new SolutionFactoryError.InvalidSolution('Solution content cannot be empty')
    }

    if(author == '') {
      throw new SolutionFactoryError.InvalidAuthor('Invalid username in solution')
    }

    if(language.name == '' || language.version == '') {
      throw new SolutionFactoryError.InvalidLanguage('Invalid language in solution')
    }

    if(fileEncoding == '') {
      throw new SolutionFactoryError.InvalidEncodingFile('Invalid type of encoding')
    }
    return new Solution(id, code, codequest, author, language, fileEncoding, result)
  }
}

export class SolutionFactoryError {
  static InvalidSolution = class extends Error {}
  static InvalidAuthor = class extends Error {}
  static InvalidLanguage = class extends Error {}
  static InvalidEncodingFile = class extends Error{}
}