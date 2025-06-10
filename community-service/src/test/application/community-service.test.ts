import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { CommentRepositoryImpl } from '../../main/nodejs/codemaster/servicies/community/infrastructure/comment-repository-impl'
import { CommentRepository } from '../../main/nodejs/codemaster/servicies/community/infrastructure/comment-repository'
import { CommentFactory } from '../../main/nodejs/codemaster/servicies/community/domain/comment-factory'
import { CommentModel } from '../../main/nodejs/codemaster/servicies/community/infrastructure/comment-model'
import { CommentId } from '../../main/nodejs/codemaster/servicies/community/domain/comment-id'
import {
  CommunityService,
  CommunityServiceError,
} from '../../main/nodejs/codemaster/servicies/community/application/community-service'
import {
  CommunityServiceImpl
} from '../../main/nodejs/codemaster/servicies/community/application/community-service-impl'
import { Comment } from '../../main/nodejs/codemaster/servicies/community/domain/comment'

describe('TestCodeQuestRepository', () => {
  const timeout = 10000
  let mongoServer: MongoMemoryServer
  let service: CommunityService

  const author = 'exampleName'
  const content = 'exampleContent'
  const questId = 'test id'

  const fakeQuestId = 'fakeQuestId'
  const fakeAuthor = 'fakeAuthor'
  const fakeId = new CommentId(fakeAuthor, fakeQuestId, new Date(Date.now()))
  let newComment: Comment

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
    service = new CommunityServiceImpl()
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
      it(
        'should create comment with correct values',
        async () => {
          const savedComment = await service.addComment(questId, author, content)

          expect(savedComment.content).toBe(content)
          expect(savedComment.questId).toBe(questId)
          expect(savedComment.author).toBe(author)
        },
        timeout
      )
    })

    describe('Get comments', () => {

      beforeEach(async () => {
        newComment = await service.addComment(questId, author, content)
        await service.addComment('questId2',  'author2', 'content2')
      }, timeout)

      it(
        'should get comment by commentId',
        async () => {
          const result = await service.getCommentById(newComment.id)

          expect(result.id).toBe(newComment.id.toString())
          expect(result.content).toBe(content)
          expect(result.questId).toBe(questId)
          expect(result.author).toBe(author)
        },
        timeout
      )

      it(
        'should get all comments by questId',
        async () => {
          const results = await service.getCommentsByCodequest(questId)

          expect(results.length).toBe(1)
          expect(results[0].id).toBe(newComment.id.toString())
          expect(results[0].content).toBe(content)
          expect(results[0].questId).toBe(questId)
          expect(results[0].author).toBe(author)
        },
        timeout
      )

      it(
        'should fail and throw exception if the questId is wrong',
        async () => {
          await expect(service.getCommentById(fakeId)).rejects.toThrow(CommunityServiceError.CommentNotFound)
        },
        timeout
      )

      it(
        'should return empty list if the questId is wrong',
        async () => {
          const results = await service.getCommentsByCodequest(fakeQuestId)

          expect(results.length).toBe(0)
        },
        timeout
      )
    })

    describe('Update comment', () => {
      const newContent = 'newContent'

      beforeEach(async () => {
        newComment = await service.addComment(questId, author, content)
      }, timeout)

      it(
        'should update a comment correctly',
        async () => {
          const result = await service.updateContent(newComment.id, newContent)

          expect(result.id).toBe(newComment.id.toString())
          expect(result.content).toBe(newContent)
        },
        timeout
      )

      it(
        'should fail and throw exception if the id is wrong',
        async () => {
          await expect(service.updateContent(fakeId, newContent)).rejects.toThrow(CommunityServiceError.CommentNotFound)
        },
        timeout
      )
    })

    describe('Delete comments', () => {

      beforeEach(async () => {
        await service.addComment(questId, author, content)
        await service.addComment('questId2', author, 'content2')
        await service.addComment('questId2', 'author2', 'content3')
      }, timeout)

      it(
        'should delete comment by id',
        async () => {
          const result = await service.deleteComment(newComment.id)

          expect(result.id).toBe(newComment.id.toString())
          await expect(service.getCommentById(newComment.id)).rejects.toThrow(CommunityServiceError.CommentNotFound)
        },
        timeout
      )

      it(
        'should delete comments created of the same author',
        async () => {
          const result = await service.deleteCommentsByAuthor(author)

          expect(result.acknowledged).toBeTruthy()
          expect(result.deletedCount).toBe(2)
        },
        timeout
      )

      it(
        'should delete comments of the same codequest',
        async () => {
          const result = await service.deleteCommentsByCodequest(questId)

          expect(result.acknowledged).toBeTruthy()
          expect(result.deletedCount).toBe(1)
        },
        timeout
      )

      it(
        'should fail and throw error if questId is wrong',
        async () => {
          await expect(
            service.deleteCommentsByCodequest(fakeQuestId)
          ).rejects.toThrow(CommunityServiceError.InvalidQuestId)
        },
        timeout
      )

      it(
        'should fail and throw error if author is wrong',
        async () => {
          await expect(service.deleteCommentsByAuthor(fakeAuthor)).rejects.toThrow(CommunityServiceError.InvalidAuthor)
        },
        timeout
      )

      it(
        'should fail and throw error if id is wrong',
        async () => {
          await expect(service.deleteComment(fakeId)).rejects.toThrow(CommunityServiceError.CommentNotFound)
        },
        timeout
      )
    })
  })
})
