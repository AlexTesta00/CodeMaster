import { ErrorRequestHandler } from 'express'
import { BAD_REQUEST, NOT_FOUND } from './status'
import { CommentError } from '../domain/comment-factory'
import { CommunityServiceError } from '../application/community-service'

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof CommentError.InvalidAuthor) {
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
  if (error instanceof CommentError.InvalidQuestId) {
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
  if (error instanceof CommentError.InvalidContent) {
    res.status(BAD_REQUEST).json({ message: error.message, success: false })
  }
  if (error instanceof CommunityServiceError.CommentNotFound) {
    res.status(NOT_FOUND).json({ message: error.message, success: false })
  }
  if (error instanceof CommunityServiceError.InvalidAuthor) {
    res.status(NOT_FOUND).json({ message: error.message, success: false })
  }
  if (error instanceof CommunityServiceError.InvalidQuestId) {
    res.status(NOT_FOUND).json({ message: error.message, success: false })
  }
  next()
}
