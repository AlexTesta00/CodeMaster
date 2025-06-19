import express from 'express'
import helmet from 'helmet'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())

export { app }
