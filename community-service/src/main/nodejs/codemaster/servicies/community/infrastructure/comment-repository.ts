import { Comment } from '../domain/comment'
import { CommentId } from '../domain/comment-id'

export interface CommentRepository {
  save(comment: Comment): Promise<Comment>
  getCommentById(id: CommentId): Promise<Comment>
  getCommentsByCodequest(questId: string): Promise<Comment[]>
}