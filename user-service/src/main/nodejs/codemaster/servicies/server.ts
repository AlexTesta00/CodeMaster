import { connectToDatabase } from './user/infrastructure/db-connection'
import { app } from './app'
import { tryCatch, chain } from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import dotenv from 'dotenv'

dotenv.config()
const port = Number(process.env.PORT!) || 3000
const hostname = '0.0.0.0'

const connectToDB = tryCatch(
  () => connectToDatabase(),
  (error) => new Error('DB connection error: ' + error)
)

const startApp = tryCatch(
  () =>
    new Promise<void>((resolve) => {
      app.listen(port, hostname, () => {
        console.log(`Server is running on port ${port}`)
        resolve()
      })
    }),
  (error) => new Error('Server start error: ' + error)
)

const startServer = pipe(
  connectToDB,
  chain(() => startApp)
)

startServer().catch((error) => {
  console.error('Error starting server:', error)
  process.exit(1)
})
