import { CommentRepository } from './comment-repository'
import { CommentId } from '../domain/comment-id'
import { Comment } from '../domain/comment'
import { Promise } from 'mongoose'

export class CommentRepositoryImpl implements CommentRepository {


  getCommentById(id: CommentId): Promise<Comment> {
    return Promise.resolve(undefined)
  }

  getCommentsByCodequest(questId: string): Promise<Comment[]> {
    return Promise.resolve([])
  }

  save(comment: Comment): Promise<Comment> {
    return Promise.resolve(undefined)
  }

}