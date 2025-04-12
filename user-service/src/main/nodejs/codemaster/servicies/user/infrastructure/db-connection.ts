import mongoose from 'mongoose'
import { tryCatch } from 'fp-ts/TaskEither'

const serverTimeout = 5000

export const connectToDatabase = tryCatch(
  async () => {
    const mongoURI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/codemaster/test'
    await mongoose.connect(
      process.env.MONGO_URI! || 'mongodb://localhost:27017/codemaster/test',
      {
        serverSelectionTimeoutMS: serverTimeout,
      }
    )
    console.log('Connected to MongoDB at ' + mongoURI)
  },
  (error) => new ConnectionError('Failed to connect to database: ' + error)
)

export const ConnectionError = class extends Error {}
