import { Comment } from '../domain/comment'
import { CommentId } from '../domain/comment-id'
import { DeleteResult } from 'mongoose'

export interface CommunityService {
  addComment(
    questId: string,
    author: string,
    content: string
  ): Promise<Comment>
  getCommentById(id: CommentId): Promise<Comment>
  getCommentsByCodequest(questId: string): Promise<Comment[]>
  updateContent(id: CommentId, newContent: string): Promise<Comment>
  deleteComment(id: CommentId): Promise<Comment>
  deleteCommentsByAuthor(user: string): Promise<DeleteResult>
  deleteCommentsByCodequest(questId: string): Promise<DeleteResult>
}

export class CommunityServiceError {
  static InvalidAuthor = class extends Error {}
  static InvalidQuestId = class extends Error {}
  static CommentNotFound = class extends Error {}
}