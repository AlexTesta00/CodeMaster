import express from 'express'
import helmet from 'helmet'
import { userRouter } from './user/interfaces/user-route'
import { trophyRouter } from './user/interfaces/trophy-route'
import { levelRouter } from './user/interfaces/level-route'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())

app.use('/api/v1/users', userRouter)
app.use('/api/v1/trophies', trophyRouter)
app.use('/api/v1/levels', levelRouter)

export { app }
