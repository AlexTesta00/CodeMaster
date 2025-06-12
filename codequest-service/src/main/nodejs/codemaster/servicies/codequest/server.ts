import { MongoConnector } from './infrastructure/db-connection'
import { createServer } from './infrastructure/express/server-factory'

const port = Number(process.env.PORT!) || 3000
const hostname = '0.0.0.0'

async function bootstrap() {
  try {
    await MongoConnector.connectToDatabase()
    const result = await createServer()
    const app = result.app
    console.log('Connected to database')
    app.listen(port, hostname, () => {
      console.log(`Server is running on port ${port}`)
    })
  } catch (error) {
    console.error('Error connecting to database:', error)
    process.exit(1)
  }
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap', err)
  process.exit(1)
})
