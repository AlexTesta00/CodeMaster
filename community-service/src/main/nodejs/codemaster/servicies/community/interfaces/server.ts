import express from 'express'
import router from './community-routes'
import { errorHandler } from './error-handler'
import helmet from 'helmet'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())

app.use('/api/v1/comments', router)
app.use(errorHandler)

export { app }
