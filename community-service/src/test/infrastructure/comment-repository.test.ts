import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import {
  CommentRepositoryImpl,
} from '../../main/nodejs/codemaster/servicies/community/infrastructure/comment-repository-impl'
import { CommentRepository } from '../../main/nodejs/codemaster/servicies/community/infrastructure/comment-repository'
import { CommentFactory } from '../../main/nodejs/codemaster/servicies/community/domain/comment-factory'
import { CommentModel } from '../../main/nodejs/codemaster/servicies/community/infrastructure/comment-model'
import { CommentId } from '../../main/nodejs/codemaster/servicies/community/domain/comment-id'

describe('TestCodeQuestRepository', () => {
  const timeout = 10000
  let mongoServer: MongoMemoryServer
  let commentRepo: CommentRepository

  const author = 'exampleName'
  const content = 'exampleContent'
  const questId = 'test id'
  const comment = CommentFactory.newComment(content, questId, author)

  const fakeQuestId = 'fakeQuestId'
  const fakeAuthor = 'fakeAuthor'
  const fakeId = new CommentId(fakeAuthor, fakeQuestId, new Date(Date.now()))

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
    commentRepo = new CommentRepositoryImpl()
  }, timeout)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  }, timeout)

  afterEach(async () => {
    await CommentModel.deleteMany({})
  }, timeout)

  describe('Test comment repository', () => {

    describe('Add new comment', () => {

      it('should create comment with correct values', async () => {
        const newComment = CommentFactory.newComment(content, questId, author)
        const savedComment = await commentRepo.save(newComment)

        expect(savedComment.id).toBe(newComment.id.toString())
        expect(savedComment.content).toBe(newComment.content)
        expect(savedComment.questId).toBe(newComment.questId)
        expect(savedComment.author).toBe(newComment.author)
      }, timeout)

      it('should throw exception if add another comment with same id', async () => {
        await commentRepo.save(comment)
        await expect(commentRepo.save(comment)).rejects.toThrow()
      }, timeout)
    })

    describe('Get comments', () => {

      const comment2 = CommentFactory.newComment('content2', 'questId2', 'author2')

      beforeEach(async () => {
        await commentRepo.save(comment)
        await commentRepo.save(comment2)
      }, timeout)

      it('should get comment by commentId', async () => {
        const result = await commentRepo.getCommentById(comment.id)

        expect(result.id).toBe(comment.id.toString())
        expect(result.content).toBe(comment.content)
        expect(result.questId).toBe(comment.questId)
        expect(result.author).toBe(comment.author)
      }, timeout)

      it('should get all comments by questId', async () => {
        const results = await commentRepo.getCommentsByCodequest(questId)

        expect(results.length).toBe(1)
        expect(results[0].id).toBe(comment.id.toString())
        expect(results[0].content).toBe(comment.content)
        expect(results[0].questId).toBe(comment.questId)
        expect(results[0].author).toBe(comment.author)
      }, timeout)

      it('should return empty list if the questId is wrong', async () => {
        await expect(commentRepo.getCommentById(fakeId)).rejects.toThrow()
      }, timeout)

      it('should return empty list if the questId is wrong', async () => {
        const results = await commentRepo.getCommentsByCodequest(fakeQuestId)

        expect(results.length).toBe(0)
      }, timeout)
    })

    describe('Update comment', () => {

      const newContent = 'newContent'

      beforeEach(async () => {
        await commentRepo.save(comment)
      }, timeout)

      it('should update a comment correctly', async () => {
        const result = await commentRepo.updateContent(comment.id, newContent)

        expect(result.id).toBe(comment.id.toString())
        expect(result.content).toBe(newContent)
      }, timeout)

      it('should fail and throw exception if the id is wrong', async () => {
        await expect(commentRepo.updateContent(fakeId, newContent)).rejects.toThrow()
      }, timeout)
    })

    describe('Delete comments', () => {

      const comment2 = CommentFactory.newComment('content2', 'questId2', author)
      const comment3 = CommentFactory.newComment('content3', 'questId2', 'author2')

      beforeEach(async () => {
        await commentRepo.save(comment)
        await commentRepo.save(comment2)
        await commentRepo.save(comment3)
      }, timeout)

      it('should delete comment by id', async () => {
        const result = await commentRepo.deleteComment(comment.id)

        expect(result.id).toBe(comment.id.toString())
        await expect(commentRepo.getCommentById(comment.id)).rejects.toThrow()
      }, timeout)

      it('should delete comments created of the same author', async () => {
        const result = await commentRepo.deleteCommentsByAuthor(author)

        expect(result.acknowledged).toBeTruthy()
        expect(result.deletedCount).toBe(2)
      }, timeout)

      it('should delete comments of the same codequest', async () => {
        const result = await commentRepo.deleteCommentsByCodequest(questId)

        expect(result.acknowledged).toBeTruthy()
        expect(result.deletedCount).toBe(1)
      }, timeout)

      it('should fail and throw error if questId is wrong', async () => {
        await expect(commentRepo.deleteCommentsByCodequest(fakeQuestId)).rejects.toThrow()
      }, timeout)

      it('should fail and throw error if author is wrong', async () => {
        await expect(commentRepo.deleteCommentsByAuthor(fakeAuthor)).rejects.toThrow()
      }, timeout)

      it('should fail and throw error if id is wrong', async () => {
        await expect(commentRepo.deleteComment(fakeId)).rejects.toThrow()
      }, timeout)
    })
  })

})