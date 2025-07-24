import supertest from 'supertest'
import { app } from '../../main/nodejs/codemaster/servicies/app'
import { none, some } from 'fp-ts/Option'
import {
  createDefaultLevel,
  DEFAULT_IMAGE_URL,
} from '../../main/nodejs/codemaster/servicies/user/domain/level-factory'
import { isRight } from 'fp-ts/Either'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { UserManagerModel } from '../../main/nodejs/codemaster/servicies/user/infrastructure/schema'

describe('Test User API', () => {
  const timeout = 10000
  const request = supertest(app)
  const nickname = 'testuser'
  const invalidNickname = 'inv@lid'
  const defaultLevel = createDefaultLevel()
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  }, timeout)

  afterAll(async () => {
    await UserManagerModel.deleteMany({})
    await mongoose.disconnect()
    await mongoServer.stop()
  }, timeout)

  describe('Test /register', () => {
    it(
      'should correctly register a user',
      async () => {
        const response = await request
          .post('/api/v1/users/register')
          .send({ nickname: nickname })
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'User registered')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('user', {
          userInfo: {
            nickname: { value: nickname },
            bio: none,
          },
          profilePicture: none,
          cv: none,
          languages: none,
          trophies: none,
          level: isRight(defaultLevel) ? defaultLevel.right : null,
        })
      },
      timeout
    )

    it(
      'should return 400 for duplicate nickname',
      async () => {
        const response = await request
          .post('/api/v1/users/register')
          .send({ nickname: nickname })
          .set('Accept', 'application/json')
        expect(response.status).toBe(400)
        expect(response.body.message).toContain('duplicate key error')
      },
      timeout
    )

    it(
      'should return 400 for invalid nickname',
      async () => {
        const response = await request
          .post('/api/v1/users/register')
          .send({ nickname: invalidNickname })
          .set('Accept', 'application/json')
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty(
          'message',
          'Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters'
        )
        expect(response.body).toHaveProperty('success', false)
      },
      timeout
    )
  })

  describe('Test / get user', () => {
    it(
      'should return correct user info',
      async () => {
        const response = await request
          .get(`/api/v1/users/${nickname}`)
          .set('Accept', 'application/json')

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'User retrieved')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('user', {
          userInfo: {
            nickname: { value: nickname },
            bio: none,
          },
          profilePicture: none,
          cv: none,
          languages: none,
          trophies: none,
          level: isRight(defaultLevel) ? defaultLevel.right : null,
        })
      },
      timeout
    )

    it(
      'should return not found user for non-existing nickname',
      async () => {
        const response = await request
          .get(`/api/v1/users/bob`)
          .set('Accept', 'application/json')

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'User not found')
        expect(response.body).toHaveProperty('success', false)
      },
      timeout
    )

    it('should correctly return all users', async () => {
      const response = await request
        .get('/api/v1/users/')
        .set('Accept', 'application/json')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'All users retrieved')
      expect(response.body).toHaveProperty('success', true)
      expect(Array.isArray(response.body.user)).toBe(true)
      expect(response.body.user.length).toBeGreaterThan(0)
      const user = response.body.user.find(
        (user: any) => user.userInfo.nickname.value === nickname
      )
      expect(user).toBeDefined()
      expect(user.userInfo.nickname.value).toBe(nickname)
    })
  })

  describe('Test /bio', () => {
    it(
      'should correctly update user bio',
      async () => {
        const response = await request
          .put('/api/v1/users/bio')
          .send({ nickname: nickname, newBio: 'Test bio' })
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'User bio changed')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('user', {
          userInfo: {
            nickname: { value: nickname },
            bio: some('Test bio'),
          },
          profilePicture: none,
          cv: none,
          languages: none,
          trophies: none,
          level: isRight(defaultLevel) ? defaultLevel.right : null,
        })
      },
      timeout
    )

    it(
      'should return 404 for user not found',
      async () => {
        const response = await request
          .put('/api/v1/users/bio')
          .send({ nickname: invalidNickname, newBio: 'New bio' })
          .set('Accept', 'application/json')

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'User not found')
        expect(response.body).toHaveProperty('success', false)
      },
      timeout
    )
  })

  describe('Test /profile-picture', () => {
    it(
      'should correctly update user profile picture',
      async () => {
        const response = await request
          .put('/api/v1/users/profile-picture')
          .send({
            nickname: nickname,
            newProfilePicture: { url: 'https://example.com/profile.jpg', alt: none },
          })
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'User profile picture changed')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('user', {
          userInfo: {
            nickname: { value: nickname },
            bio: some('Test bio'),
          },
          profilePicture: some({ url: 'https://example.com/profile.jpg', alt: none }),
          cv: none,
          languages: none,
          trophies: none,
          level: isRight(defaultLevel) ? defaultLevel.right : null,
        })
      },
      timeout
    )

    it(
      'should correctrly update alt value',
      async () => {
        const response = await request
          .put('/api/v1/users/profile-picture')
          .send({
            nickname: nickname,
            newProfilePicture: {
              url: 'https://example.com/profile.jpg',
              alt: some('Alt text'),
            },
          })
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'User profile picture changed')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('user', {
          userInfo: {
            nickname: { value: nickname },
            bio: some('Test bio'),
          },
          profilePicture: some({
            url: 'https://example.com/profile.jpg',
            alt: some('Alt text'),
          }),
          cv: none,
          languages: none,
          trophies: none,
          level: isRight(defaultLevel) ? defaultLevel.right : null,
        })
      },
      timeout
    )

    it(
      'should return 404 for user not found',
      async () => {
        const response = await request
          .put('/api/v1/users/profile-picture')
          .send({ nickname: invalidNickname, newProfilePicture: 'invalid-url' })
          .set('Accept', 'application/json')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'User not found')
        expect(response.body).toHaveProperty('success', false)
      },
      timeout
    )
  })

  describe('Test /cv', () => {
    it(
      'should correctly update user CV',
      async () => {
        const response = await request
          .put('/api/v1/users/cv')
          .send({ nickname: nickname, newCV: { url: 'https://example.com/cv.pdf' } })
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'User CV changed')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('user', {
          userInfo: {
            nickname: { value: nickname },
            bio: some('Test bio'),
          },
          profilePicture: some({
            url: 'https://example.com/profile.jpg',
            alt: some('Alt text'),
          }),
          cv: some({ url: 'https://example.com/cv.pdf' }),
          languages: none,
          trophies: none,
          level: isRight(defaultLevel) ? defaultLevel.right : null,
        })
      },
      timeout
    )

    it(
      'should return 404 for user not found',
      async () => {
        const response = await request
          .put('/api/v1/users/cv')
          .send({ nickname: invalidNickname, newCV: { url: 'invalid-url' } })
          .set('Accept', 'application/json')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'User not found')
        expect(response.body).toHaveProperty('success', false)
      },
      timeout
    )
  })

  describe('Test /languages', () => {
    it(
      'should correctly update user languages',
      async () => {
        const response = await request
          .put('/api/v1/users/languages')
          .send({
            nickname: nickname,
            newLanguages: [{ name: 'Kotlin' }, { name: 'Scala' }],
          })
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'User languages changed')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('user', {
          userInfo: {
            nickname: { value: nickname },
            bio: some('Test bio'),
          },
          profilePicture: some({
            url: 'https://example.com/profile.jpg',
            alt: some('Alt text'),
          }),
          cv: some({ url: 'https://example.com/cv.pdf' }),
          languages: some([{ name: 'Kotlin' }, { name: 'Scala' }]),
          trophies: none,
          level: isRight(defaultLevel) ? defaultLevel.right : null,
        })
      },
      timeout
    )

    it(
      'should return 404 for user not found',
      async () => {
        const response = await request
          .put('/api/v1/users/languages')
          .send({ nickname: invalidNickname, newLanguages: ['Kotlin', 'Scala'] })
          .set('Accept', 'application/json')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'User not found')
        expect(response.body).toHaveProperty('success', false)
      },
      timeout
    )
  })

  describe('Test /trophies', () => {
    it(
      'should correctly update user trophies',
      async () => {
        const trophies = [
          {
            title: { value: 'Trophy 1' },
            description: 'First trophy',
            url: 'https://example.com',
            xp: 100,
          },
          {
            title: { value: 'Trophy 2' },
            description: 'Second trophy',
            url: 'https://example-two.com',
            xp: 50,
          },
        ]
        const response = await request
          .put('/api/v1/users/trophies')
          .send({ nickname: nickname, newTrophies: trophies })
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'User trophies changed')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('user', {
          userInfo: {
            nickname: { value: nickname },
            bio: some('Test bio'),
          },
          profilePicture: some({
            url: 'https://example.com/profile.jpg',
            alt: some('Alt text'),
          }),
          cv: some({ url: 'https://example.com/cv.pdf' }),
          languages: some([{ name: 'Kotlin' }, { name: 'Scala' }]),
          trophies: some(trophies),
          level: isRight(defaultLevel) ? defaultLevel.right : null,
        })
      },
      timeout
    )

    it(
      'should return 404 for user not found',
      async () => {
        const response = await request
          .put('/api/v1/users/trophies')
          .send({ nickname: invalidNickname, newTrophies: [{ title: 'Trophy 1' }] })
          .set('Accept', 'application/json')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'User not found')
        expect(response.body).toHaveProperty('success', false)
      },
      timeout
    )
  })

  describe('Test /level', () => {
    const firstLevel = { grade: 1, title: 'Novice', xpLevel: 150, url: DEFAULT_IMAGE_URL }
    const secondLevel = {
      grade: 2,
      title: 'Expert',
      xpLevel: 200,
      url: DEFAULT_IMAGE_URL,
    }
    const thirdLevel = { grade: 3, title: 'Master', xpLevel: 300, url: DEFAULT_IMAGE_URL }
    const firstTrophy = {
      title: { value: 'Welcome' },
      description: 'First trophy',
      url: 'https://example.com',
      xp: 1,
    }
    const secondTrophy = {
      title: { value: 'First solution' },
      description: 'First Solution',
      url: 'https://example-first.com',
      xp: 100,
    }
    const thirdTrophy = {
      title: { value: 'Second solution' },
      description: 'Second Solution',
      url: 'https://example-second.com',
      xp: 200,
    }

    beforeAll(async () => {
      await request
        .post('/api/v1/levels/create')
        .send(firstLevel)
        .set('Accept', 'application/json')
      await request
        .post('/api/v1/levels/create')
        .send(secondLevel)
        .set('Accept', 'application/json')
      await request
        .post('/api/v1/levels/create')
        .send(thirdLevel)
        .set('Accept', 'application/json')
      await request
        .post('/api/v1/trophies/create')
        .send(firstTrophy)
        .set('Accept', 'application/json')
      await request
        .post('/api/v1/trophies/create')
        .send(secondTrophy)
        .set('Accept', 'application/json')
      await request
        .post('/api/v1/trophies/create')
        .send(thirdTrophy)
        .set('Accept', 'application/json')
    })

    afterAll(async () => {
      await request
        .delete(`/api/v1/levels/${firstLevel.grade}`)
        .set('Accept', 'application/json')
      await request
        .delete(`/api/v1/levels/${secondLevel.grade}`)
        .set('Accept', 'application/json')
      await request
        .delete(`/api/v1/levels/${thirdLevel.grade}`)
        .set('Accept', 'application/json')
    })

    it(
      'should correctly update user level in Novice',
      async () => {
        await request
          .put('/api/v1/users/trophies')
          .send({ nickname: nickname, newTrophies: firstTrophy })
          .set('Accept', 'application/json')
        const response = await request
          .get(`/api/v1/users/level/${nickname}`)
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'User level computed')
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('user', {
          grade: { value: 1 },
          title: 'Novice',
          xpLevel: 150,
          imageUrl: DEFAULT_IMAGE_URL,
        })
      },
      timeout
    )

    it(
      'should return 404 for user not found',
      async () => {
        const response = await request
          .get(`/api/v1/users/level/${invalidNickname}`)
          .set('Accept', 'application/json')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'User not found')
        expect(response.body).toHaveProperty('success', false)
      },
      timeout
    )
  })

  describe('Test /delete', () => {
    it(
      'should correctly delete user',
      async () => {
        const response = await request
          .delete(`/api/v1/users/${nickname}`)
          .set('Accept', 'application/json')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message', 'User deleted')
        expect(response.body).toHaveProperty('success', true)
      },
      timeout
    )

    it(
      'should return 404 for user not found',
      async () => {
        const response = await request
          .delete(`/api/v1/users/${nickname}`)
          .set('Accept', 'application/json')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'User not found')
        expect(response.body).toHaveProperty('success', false)
      },
      timeout
    )
  })
})
