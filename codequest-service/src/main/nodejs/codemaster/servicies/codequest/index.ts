import { connectToDatabase } from './infrastructure/db-connection'
import { app } from './interfaces/server'
import * as dotenv from 'dotenv'

dotenv.config()
const port = Number(process.env.PORT!)
const hostname = '0.0.0.0'

app.listen(port, hostname, async () => {
  console.log(`Server is running on port ${port}`)
  await connectToDatabase()
})
