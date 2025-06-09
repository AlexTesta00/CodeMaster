import { Comment } from '../domain/comment'
import { CommentId } from '../domain/comment-id'
import { DeleteResult } from 'mongoose'

export interface CommentRepository {
  save(comment: Comment): Promise<Comment>
  updateContent(id: CommentId, newContent: string): Promise<Comment>
  getCommentById(id: CommentId): Promise<Comment>
  getCommentsByCodequest(questId: string): Promise<Comment[]>
  deleteCommentsByAuthor(user: string): Promise<DeleteResult>
  deleteCommentsByCodequest(questId: string): Promise<DeleteResult>
  deleteComment(id: CommentId): Promise<Comment>
}