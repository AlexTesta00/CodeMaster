import { CommunityService, CommunityServiceError } from './community-service'
import { Comment } from '../domain/comment'
import { DeleteResult } from 'mongoose'
import { CommentId } from '../domain/comment-id'
import { CommentError, CommentFactory } from '../domain/comment-factory'
import { CommentRepositoryImpl } from '../infrastructure/comment-repository-impl'
import { CommentRepository } from '../infrastructure/comment-repository'

export class CommunityServiceImpl implements CommunityService {

  private repository: CommentRepository = new CommentRepositoryImpl()

  async addComment(questId: string, author: string, content: string): Promise<Comment> {
    let comment = CommentFactory.newComment(content, questId, author)
    return await this.repository.save(comment)
  }

  async getCommentById(id: CommentId): Promise<Comment> {
    try {
      return await this.repository.getCommentById(id)
    } catch(e) {
      throw new CommunityServiceError.CommentNotFound('Comment with id: "'+ id.toString() +'" not found')
    }
  }

  async getCommentsByCodequest(questId: string): Promise<Comment[]> {
    try {
      return await this.repository.getCommentsByCodequest(questId)
    } catch(e) {
      throw new CommunityServiceError.InvalidQuestId('Comments from questId: "'+ questId +'" not found')
    }
  }

  async updateContent(id: CommentId, newContent: string): Promise<Comment> {
    try {
      return await this.repository.updateContent(id, newContent)
    } catch(e) {
      throw new CommunityServiceError.CommentNotFound('Comment with id: "'+ id.toString() +'" not found')
    }
  }

  async deleteComment(id: CommentId): Promise<Comment> {
    try {
      return await this.repository.deleteComment(id)
    } catch(e) {
      throw new CommunityServiceError.CommentNotFound('Comment with id: "'+ id.toString() +'" not found')
    }
  }

  async deleteCommentsByAuthor(user: string): Promise<DeleteResult> {
    try {
      return await this.repository.deleteCommentsByAuthor(user)
    } catch(e) {
      throw new CommunityServiceError.InvalidAuthor('Comment published from user: "'+ user +'" not found')
    }
  }

  async deleteCommentsByCodequest(questId: string): Promise<DeleteResult> {
    try {
      return await this.repository.deleteCommentsByCodequest(questId)
    } catch(e) {
      throw new CommunityServiceError.InvalidQuestId('Comment from questId: "'+ questId +'" not found')
    }
  }

}