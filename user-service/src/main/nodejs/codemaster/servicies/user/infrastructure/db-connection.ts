import mongoose from 'mongoose'
import { tryCatch } from 'fp-ts/TaskEither'

const serverTimeout = 5000

export const connectToDatabase = tryCatch(
  async () => {
    const mongoURI = process.env.MONGO_URI ?? 'mongodb://mongo-authentication:27017/codemaster-user-db-test'
    await mongoose.connect(
      process.env.MONGO_URI! || 'mongodb://mongo-authentication:27017/codemaster-user-db-test',
      {
        serverSelectionTimeoutMS: serverTimeout,
      }
    )
    console.log('Connected to MongoDB at ' + mongoURI)
  },
  (error) => new ConnectionError('Failed to connect to database: ' + error)
)

export const isDatabaseConnected = (): boolean => mongoose.connection.readyState === 1

export const ConnectionError = class extends Error {}
