import { connectToDatabase } from './infrastructure/db-connection'
import { app } from './app'
import { connectToRabbit } from './infrastructure/publisher'

const port = Number(process.env.PORT!) || 4004
const hostname = '0.0.0.0'

const connectToDB = async () => {
  try {
    await connectToDatabase()
    console.log('Connected to database')
  } catch (error) {
    console.error('Error connecting to database:', error)
    process.exit(1)
  }
}

const startApp = () => {
  return new Promise<void>((resolve) => {
    app.listen(port, hostname, () => {
      console.log(`Server is running on port ${port}`)
      resolve()
    })
  })
}

const startServer = async () => {
  await connectToDB()
  await startApp()
}

connectToRabbit()
  .catch((err) => {
    console.log('AuthService: Error connecting to RabbitMQ:', err)
    process.exit(1)
  })
  .then(() => console.log('AuthService:: Connected to RabbitMQ successfully'))

startServer().catch((error) => {
  console.error('Error starting server:', error)
  process.exit(1)
})
