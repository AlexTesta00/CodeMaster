import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import supertest from 'supertest'
import * as dotenv from 'dotenv'
import { app } from '../../main/nodejs/codemaster/servicies/community/interfaces/server'
import { CommentModel } from '../../main/nodejs/codemaster/servicies/community/infrastructure/comment-model'
import { CommentId } from '../../main/nodejs/codemaster/servicies/community/domain/comment-id'
import { Comment } from '../../main/nodejs/codemaster/servicies/community/domain/comment'
import {
  BAD_REQUEST,
  CREATED,
  NOT_FOUND,
  OK,
} from '../../main/nodejs/codemaster/servicies/community/interfaces/status'

dotenv.config()

describe('Test API', () => {
  let mongoServer: MongoMemoryServer

  const timeout: number = 20000
  const request = supertest(app)
  const baseUrl = '/api/v1/comments/'

  const author = 'exampleName'
  const content = 'exampleContent'
  const questId = 'test id'

  const fakeQuestId = 'fakeQuestId'
  const fakeAuthor = 'fakeAuthor'
  const fakeId = CommentId.fromParts(fakeAuthor, fakeQuestId, new Date(Date.now()))

  const comment = {
    author: author,
    content: content,
    questId: questId,
  }

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  }, timeout)

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  afterEach(async () => {
    await CommentModel.deleteMany({})
  }, timeout)

  function checkComment(res: Comment) {
    expect(res).toHaveProperty('questId', questId)
    expect(res).toHaveProperty('author', author)
    expect(res).toHaveProperty('content', content)
  }

  describe('POST comment', () => {
    it(
      'should return 201 and add new comment correctly',
      async () => {
        const response = await request
          .post(baseUrl)
          .send(comment)
          .set('Accept', 'application/json')

        expect(response.status).toBe(CREATED)
        expect(response.body.message).toBe('Add comment')
        expect(response.body.success).toBe(true)
        checkComment(response.body.result)
      },
      timeout
    )

    it(
      'should return 400 if comment has invalid author',
      async () => {
        const response = await request
          .post(baseUrl)
          .send({
            author: '',
            content: content,
            questId: questId,
          })
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.message).toBe('Author cannot be empty')
        expect(response.body.success).toBe(false)
      },
      timeout
    )

    it(
      'should return 400 if comment has invalid questId',
      async () => {
        const response = await request
          .post(baseUrl)
          .send({
            author: author,
            content: content,
            questId: '',
          })
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.message).toBe('QuestId cannot be empty')
        expect(response.body.success).toBe(false)
      },
      timeout
    )

    it(
      'should return 400 if comment ha an empty content',
      async () => {
        const response = await request
          .post(baseUrl)
          .send({
            author: author,
            content: '',
            questId: questId,
          })
          .set('Accept', 'application/json')

        expect(response.status).toBe(BAD_REQUEST)
        expect(response.body.message).toBe('Cannot post and empty comment')
        expect(response.body.success).toBe(false)
      },
      timeout
    )
  })

  describe('GET comments', () => {
    const questId2 = 'questId2'

    beforeEach(async () => {
      await request
        .post(baseUrl)
        .send({
          author: author,
          content: content,
          questId: questId,
        })
        .set('Accept', 'application/json')

      await request
        .post(baseUrl)
        .send({
          author: author,
          content: content,
          questId: questId2,
        })
        .set('Accept', 'application/json')
    }, timeout)

    it(
      'should return 200 and get comment by id',
      async () => {
        const newComment = await request
          .post(baseUrl)
          .send(comment)
          .set('Accept', 'application/json')

        const response = await request.get(baseUrl + '/' + newComment.body.result.id)

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe('Get comment')
        expect(response.body.success).toBe(true)
        checkComment(response.body.result)
      },
      timeout
    )

    it(
      'should return 200 and get all comments of a codequest',
      async () => {
        const response = await request.get(baseUrl + '/codequests/' + questId)

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe('Get comments')
        expect(response.body.success).toBe(true)
        checkComment(response.body.result[0])
      },
      timeout
    )

    it(
      'should return 200 and empty list if there are no comments of a codequest',
      async () => {
        const response = await request.get(baseUrl + '/codequests/' + fakeQuestId)

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe('Get comments')
        expect(response.body.success).toBe(true)
        expect(response.body.result.length).toBe(0)
      },
      timeout
    )

    it(
      'should return 404 if comment is not found',
      async () => {
        const response = await request.get(baseUrl + '/' + fakeId)

        expect(response.status).toBe(NOT_FOUND)
        expect(response.body.message).toBe(`Comment with id: "${fakeId}" not found`)
        expect(response.body.success).toBe(false)
      },
      timeout
    )
  })

  describe('PUT comment', () => {
    it(
      'should return 200 and change content correctly',
      async () => {
        const newComment = await request
          .post(baseUrl)
          .send(comment)
          .set('Accept', 'application/json')

        const response = await request
          .put(baseUrl + '/' + newComment.body.result.id)
          .send({
            content: 'newContent',
          })
          .set('Accept', 'application/json')

        expect(response.status).toBe(OK)
        expect(response.body.message).toBe(`Change comment`)
        expect(response.body.success).toBe(true)
        expect(response.body.result.content).toBe('newContent')
      },
      timeout
    )

    it(
      'should return 404 if comment id is not found',
      async () => {
        await request.post(baseUrl).send(comment).set('Accept', 'application/json')

        const response = await request
          .put(baseUrl + '/' + fakeId)
          .send({
            content: 'newContent',
          })
          .set('Accept', 'application/json')

        expect(response.status).toBe(NOT_FOUND)
        expect(response.body.message).toBe(`Comment with id: "${fakeId}" not found`)
        expect(response.body.success).toBe(false)
      },
      timeout
    )
  })

  describe('DELETE comment', () => {
    beforeEach(async () => {
      await request
        .post(baseUrl)
        .send({
          author: author,
          content: content,
          questId: questId,
        })
        .set('Accept', 'application/json')
    })

    it('should return 200 and delete comment correctly', async () => {
      const newComment = await request
        .post(baseUrl)
        .send(comment)
        .set('Accept', 'application/json')

      const deleteResponse = await request.delete(
        baseUrl + '/' + newComment.body.result.id
      )

      const getResponse = await request.get(baseUrl + '/' + newComment.body.result.id)

      expect(deleteResponse.status).toBe(OK)
      expect(deleteResponse.body.message).toBe(`Delete comment`)
      expect(deleteResponse.body.success).toBe(true)
      checkComment(deleteResponse.body.result)

      expect(getResponse.status).toBe(NOT_FOUND)
      expect(getResponse.body.message).toBe(
        `Comment with id: "${newComment.body.result.id}" not found`
      )
      expect(getResponse.body.success).toBe(false)
    })

    it('should return 200 and delete comment correctly', async () => {
      const deleteResponse = await request.delete(baseUrl + '/' + fakeId)

      expect(deleteResponse.status).toBe(NOT_FOUND)
      expect(deleteResponse.body.message).toBe(`Comment with id: "${fakeId}" not found`)
      expect(deleteResponse.body.success).toBe(false)
    })
  })
})
