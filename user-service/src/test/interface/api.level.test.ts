import supertest from 'supertest'
import { app } from '../../main/nodejs/codemaster/servicies/app'
import { DEFAULT_IMAGE_URL } from '../../main/nodejs/codemaster/servicies/user/domain/level-factory'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { LevelModel } from '../../main/nodejs/codemaster/servicies/user/infrastructure/schema'

describe('Test Level API', () => {
  const request = supertest(app)
  const timeout = 10000
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  }, timeout)

  afterAll(async () => {
    await LevelModel.deleteMany({})
    await mongoose.disconnect()
    await mongoServer.stop()
  }, timeout)

  describe('Test /api/v1/levels', () => {
    it(
      'should correctly add a level',
      async () => {
        const level = { grade: 1, title: 'Novice', xpLevel: 1, url: DEFAULT_IMAGE_URL }
        const response = await request
          .post('/api/v1/levels/create')
          .send(level)
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'Levels changed')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('level', {
          grade: { value: 1 },
          title: 'Novice',
          xpLevel: 1,
          imageUrl: DEFAULT_IMAGE_URL,
        })
      },
      timeout
    )

    it('should return corretly all levels', async () => {
      const response = await request
        .get('/api/v1/levels/')
        .set('Accept', 'application/json')
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Levels retrieved')
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('level', [
        {
          grade: { value: 1 },
          title: 'Novice',
          xpLevel: 1,
          imageUrl: DEFAULT_IMAGE_URL,
        },
      ])
    })

    it(
      'should correctly remove a level',
      async () => {
        const grade = 1
        const response = await request
          .delete(`/api/v1/levels/${grade}`)
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'Levels changed')
        expect(response.body).toHaveProperty('success', true)
      },
      timeout
    )

    it(
      'should return 404 when removing a level that does not exist',
      async () => {
        const level = 2
        const response = await request
          .delete(`/api/v1/levels/${level}`)
          .set('Accept', 'application/json')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'Level not found')
      },
      timeout
    )
  })
})
