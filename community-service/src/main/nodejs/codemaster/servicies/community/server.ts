import { MongoConnector } from './infrastructure/db-connection'
import { createServer } from './infrastructure/express/server-factory'

const port = Number(process.env.PORT!) || 4007
const hostname = '0.0.0.0'

async function bootstrap() {
  try {
    await MongoConnector.connectToDatabase()
    console.log('Connected to database')
    const app = await createServer()
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
