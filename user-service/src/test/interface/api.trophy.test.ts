import supertest from 'supertest'
import { app } from '../../main/nodejs/codemaster/servicies/app'
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {TrophyModel} from "../../main/nodejs/codemaster/servicies/user/infrastructure/schema";

describe('Test Trophy API', () => {
  const request = supertest(app)
  const timeout = 10000
    let mongoServer: MongoMemoryServer

  describe('Test /api/v1/trophies', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()
        await mongoose.connect(uri)
    }, timeout)

    afterAll(async () => {
        await TrophyModel.deleteMany({})
        await mongoose.disconnect()
        await mongoServer.stop()
    }, timeout)

    it(
      'should correctly add a trophy',
      async () => {
        const trophy = {
          title: 'First trophy',
          description: 'First trophy description',
          url: 'https://example.com/trophy.png',
          xp: 100,
        }
        const response = await request
          .post('/api/v1/trophies/create')
          .send(trophy)
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'Trophies changed')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('trophy', {
          title: { value: 'First trophy' },
          description: 'First trophy description',
          url: 'https://example.com/trophy.png',
          xp: 100,
        })
      },
      timeout
    )

    it('should return corretly all trophies', async () => {
      const response = await request
        .get('/api/v1/trophies/')
        .set('Accept', 'application/json')
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Trophies retrieved')
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('trophies', [
        {
          title: { value: 'First trophy' },
          description: 'First trophy description',
          url: 'https://example.com/trophy.png',
          xp: 100,
        },
      ])
    })

    it(
      'should correctly remove a trophy',
      async () => {
        const trophy = 'First trophy'
        const response = await request
          .delete(`/api/v1/trophies/trophies/${trophy}`)
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'Trophies changed')
        expect(response.body).toHaveProperty('success', true)
      },
      timeout
    )

    it(
      'should return 404 when removing a trophy that does not exist',
      async () => {
        const trophy = 'Non-existing trophy'
        const response = await request
          .delete(`/api/v1/trophies/trophies/${trophy}`)
          .set('Accept', 'application/json')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'Trophy not found')
        expect(response.body).toHaveProperty('success', false)
      },
      timeout
    )
  })
})
