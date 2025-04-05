import { ErrorRequestHandler } from 'express'
import { LanguageError } from '../domain/language/language-factory'
import {BAD_REQUEST, CONFLICT, INTERNAL_ERROR, NOT_FOUND} from './status'
import { CodeQuestError } from '../domain/codequest/codequest-factory'
import { CodeQuestServiceError } from "../application/codequest-service";

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
  if (error instanceof CodeQuestError.InvalidLanguage) {
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
  if (error instanceof LanguageError.InvalidName) {
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
  if (error instanceof LanguageError.InvalidVersion) {
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
  if (error instanceof CodeQuestServiceError.LanguageNotFound) {
    res.status(NOT_FOUND).json({ message: error.message, success: false })
  }
  if (error instanceof CodeQuestServiceError.CodeQuestNotFound) {
    res.status(NOT_FOUND).json({ message: error.message, success: false })
  }
  if (error instanceof CodeQuestServiceError.LanguageVersionNotFound) {
    res.status(NOT_FOUND).json({ message: error.message, success: false })
  }
  if (error instanceof CodeQuestServiceError.InvalidCodeQuestId) {
    res.status(INTERNAL_ERROR).json({ message: error.message, success: false })
  }
  next()
}