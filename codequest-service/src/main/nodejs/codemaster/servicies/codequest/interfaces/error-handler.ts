import { ErrorRequestHandler } from 'express'
import { LanguageError } from '../domain/language/language-factory'
import { BAD_REQUEST, CONFLICT } from './status'
import { CodeQuestError } from '../domain/codequest/codequest-factory'

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof CodeQuestError.InvalidAuthor) {
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
  if (error instanceof CodeQuestError.InvalidProblem) {
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
  if (error instanceof CodeQuestError.InvalidTitle) {
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
  if (error instanceof LanguageError.InvalidName) {
    res.status(CONFLICT).json({ message: error.message, success: false })
  }
  if (error instanceof LanguageError.InvalidVersion) {
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
  next()
}