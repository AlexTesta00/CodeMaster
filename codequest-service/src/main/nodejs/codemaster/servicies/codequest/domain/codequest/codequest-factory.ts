import { CodeQuest } from './codequest'
import { Language } from '../language/language'
import { Problem } from './problem'

export class CodeQuestFactory {
  static newCodeQuest(
    id: string,
    title: string,
    author: string,
    problem: Problem,
    timestamp: Date | null,
    languages: Language[]
  ): CodeQuest {
    if (!author) {
      throw new CodeQuestError.InvalidAuthor("Invalid nickname: this user doesn't exist")
    }

    if (!problem || problem.body == '') {
      throw new CodeQuestError.InvalidProblem(
        "Invalid problem: problem's body cannot be empty"
      )
    }

    if (problem.examples.length == 0) {
      throw new CodeQuestError.InvalidProblem(
        'Invalid problem: problem require at least one example'
      )
    }

    for (const example of problem.examples) {
      if (example.input == '' || example.output == '') {
        throw new CodeQuestError.InvalidProblem('Invalid problem: invalid examples')
      }
    }

    if (!title || title == '') {
      throw new CodeQuestError.InvalidTitle("Invalid title: title's body cannot be empty")
    }

    if (!languages || languages.length == 0) {
      throw new CodeQuestError.InvalidLanguage(
        'Invalid languages: languages cannot be null'
      )
    }

    return new CodeQuest(id, title, author, problem, timestamp, languages)
  }
}

export class CodeQuestError {
  static InvalidLanguage = class extends Error {}
  static InvalidAuthor = class extends Error {}
  static InvalidProblem = class extends Error {}
  static InvalidTitle = class extends Error {}
}
