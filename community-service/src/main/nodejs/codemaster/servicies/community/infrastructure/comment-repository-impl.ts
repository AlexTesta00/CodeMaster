import { CommentRepository } from './comment-repository'
import { CommentId } from '../domain/comment-id'
import { Comment } from '../domain/comment'
import { CommentModel } from './comment-model'
import { CommentFactory } from '../domain/comment-factory'
import { DeleteResult } from 'mongoose'

export class CommentRepositoryImpl implements CommentRepository {
  async save(comment: Comment): Promise<Comment> {
    return await new CommentModel({
      id: comment.id,
      questId: comment.questId,
      author: comment.author,
      content: comment.content,
      timestamp: comment.timestamp,
    }).save()
  }

  async getCommentById(id: CommentId): Promise<Comment> {
    return CommentModel.findOne({ id }).orFail()
  }

  async getCommentsByCodequest(questId: string): Promise<Comment[]> {
    const comments = await CommentModel.find({ questId: questId })
    return comments.map((comment) =>
      CommentFactory.newComment(
        comment.content,
        comment.questId,
        comment.author,
        comment.timestamp,
        comment.id
      )
    )
  }

  async updateContent(id: CommentId, newContent: string): Promise<Comment> {
    await CommentModel.findOneAndUpdate({ id }, { content: newContent }).orFail()
    return CommentModel.findOne({ id }).orFail()
  }

  async deleteComment(id: CommentId): Promise<Comment> {
    return CommentModel.findOneAndDelete({ id }).orFail()
  }

  async deleteCommentsByAuthor(user: string): Promise<DeleteResult> {
    return CommentModel.deleteMany({ author: user }).orFail()
  }

  async deleteCommentsByCodequest(questId: string): Promise<DeleteResult> {
    return CommentModel.deleteMany({ questId: questId }).orFail()
  }
}
