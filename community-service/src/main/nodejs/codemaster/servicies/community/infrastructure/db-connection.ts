import mongoose from 'mongoose'
import { env } from 'node:process'

export const connectToDatabase = async () => {
  try {
    const mongoURI = env.MONGO_URI ?? 'mongodb://localhost:27017/codemaster/test'
    await mongoose.connect(
      env.MONGO_URI! || 'mongodb://localhost:27017/codemaster/test'
    )
    console.log('Connected to MongoDB at ' + mongoURI)
  } catch (error) {
    console.log(`Connection to DB failed: ${error}`)
    throw new ConnectionError()
  }
}

export const isDatabaseConnected = (): boolean => mongoose.connection.readyState === 1

export const ConnectionError = class extends Error {}
