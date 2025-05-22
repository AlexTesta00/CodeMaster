import express from 'express'
import helmet from 'helmet'
import { router } from './interfaces/authentication-routes'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(cookieParser())

app.use('/api/v1/authentication', router)

export { app }
