import { app } from "../../main/nodejs/codemaster/servicies/codequest/interfaces/app";
import supertest from 'supertest'
import {
    BAD_REQUEST,
    CONFLICT,
    CREATED,
    INTERNAL_ERROR,
    OK
} from "../../main/nodejs/codemaster/servicies/codequest/interfaces/status";
import mongoose from "mongoose";
import {Problem} from "../../main/nodejs/codemaster/servicies/codequest/domain/codequest/problem";
import {Example} from "../../main/nodejs/codemaster/servicies/codequest/domain/codequest/example";
import {LanguageFactory} from "../../main/nodejs/codemaster/servicies/codequest/domain/language/language-factory";
import * as dotenv from 'dotenv'
import { populateLanguages } from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/language/populate'
import {
    CodeQuestModel
} from '../../main/nodejs/codemaster/servicies/codequest/infrastructure/codequest/codequest-model'
import { Language } from '../../main/nodejs/codemaster/servicies/codequest/domain/language/language'
import { CodeQuest } from '../../main/nodejs/codemaster/servicies/codequest/domain/codequest/codequest'
import { MongoMemoryServer } from 'mongodb-memory-server'

dotenv.config();

describe('Test API', () => {

    let mongoServer: MongoMemoryServer

    const timeout: number = 20000
    const request = supertest(app)
    const author = 'example name';
    const problem = new Problem("Problem example", [new Example('example1', 'example2', 'explanation')], ['constraints']);
    const title = 'Title example';
    const languages = [LanguageFactory.createLanguage("Java", ["17", "21"]), LanguageFactory.createLanguage("Scala", ["3.3", "3.4"])]
    const codeQuest = {
        title: title,
        author: author,
        problem: problem,
        languages: languages
    }

    const codeQuest2 = {
        title: title + '2',
        author: author + '2',
        problem: problem,
        languages: languages
    }

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()
        await mongoose.connect(uri)
        await populateLanguages()
    }, timeout)

    afterEach(async () => {
        await CodeQuestModel.deleteMany({})
    })

    afterAll(async () =>{
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    describe('Test add new codequest', () => {

        it('should return 201 and add codequest', async () => {
            const response = await request
                .post('/codequests')
                .send(codeQuest)
                .set('Accept', 'application/json')

            expect(response.status).toBe(CREATED)
            expect(response.body.message).toBe('Codequests add')
            expect(response.body.success).toBe(true)
            checkCodequest(response.body.codequest)
           }, timeout)

        it('should return 200 and get all codequests', async () => {
            await request
              .post('/codequests')
              .send(codeQuest)
              .set('Accept', 'application/json')
            await request
              .post('/codequests')
              .send(codeQuest2)
              .set('Accept', 'application/json')

            const response = await request
              .get('/codequests')

            expect(response.status).toBe(OK)
            expect(response.body.message).toBe('Codequests get')
            expect(response.body.success).toBe(true)
            expect(response.body.codequests.length).toBe(2)
            expect(response.body.codequests[1]).toHaveProperty('author', author + '2')
            expect(response.body.codequests[1]).toHaveProperty('title',  title + '2')
            expect(response.body.codequests[1]).toHaveProperty('problem', problem)
            expect(response.body.codequests[1].languages.map((langDoc: Language) => LanguageFactory.createLanguage(langDoc.name, langDoc.versions))).toEqual(languages);
        })

        it('should return 200 and a codequest by id', async () => {
            const addCodequest = await request
              .post('/codequests')
              .send(codeQuest)
              .set('Accept', 'application/json')
            const response = await request
              .get('/codequests/' + addCodequest.body.codequest.id)

            expect(response.status).toBe(OK)
            expect(response.body.message).toBe('Codequest get')
            expect(response.body.success).toBe(true)
            checkCodequest(response.body.codequest)
        })
    })

    function checkCodequest(codequest: CodeQuest) {
        expect(codequest).toHaveProperty('author', author)
        expect(codequest).toHaveProperty('title',  title)
        expect(codequest).toHaveProperty('problem', problem)
        expect(codequest.languages.map((langDoc: Language) => LanguageFactory.createLanguage(langDoc.name, langDoc.versions))).toEqual(languages);
    }
})