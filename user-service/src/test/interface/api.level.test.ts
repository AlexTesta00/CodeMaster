import supertest from 'supertest'
import { app } from '../../main/nodejs/codemaster/servicies/app'
import { connectToDatabase } from '../../main/nodejs/codemaster/servicies/user/infrastructure/db-connection'
import dotenv from 'dotenv'

describe('Test Level API', () => {
  const request = supertest(app)
  const timeout = 10000

  beforeAll(async () => {
    dotenv.config()
    await connectToDatabase()
  })

  afterAll(async () => {
    const grade = 1
    await request.delete(`/api/v1/levels/${grade}`).set('Accept', 'application/json')
  }, timeout)

  describe('Test /api/v1/levels', () => {
    it(
      'should correctly add a level',
      async () => {
        const level = { grade: 1, title: 'Novice', xpLevel: 1 }
        const response = await request
          .post('/api/v1/levels/')
          .send(level)
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'Levels changed')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('level', {
          grade: { value: 1 },
          title: 'Novice',
          xpLevel: 1,
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
