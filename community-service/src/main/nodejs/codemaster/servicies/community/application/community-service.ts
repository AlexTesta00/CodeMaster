import { Comment } from '../domain/comment'
import { DeleteResult } from 'mongoose'

export interface CommunityService {
  addComment(questId: string, author: string, content: string): Promise<Comment>

  getCommentById(id: string): Promise<Comment>
  getCommentsByCodequest(questId: string): Promise<Comment[]>
  updateContent(id: string, newContent: string): Promise<Comment>
  deleteComment(id: string): Promise<Comment>
  deleteCommentsByAuthor(user: string): Promise<DeleteResult>
  deleteCommentsByCodequest(questId: string): Promise<DeleteResult>
}

export class CommunityServiceError {
  static InvalidAuthor = class extends Error {}
  static InvalidQuestId = class extends Error {}
  static CommentNotFound = class extends Error {}
}
