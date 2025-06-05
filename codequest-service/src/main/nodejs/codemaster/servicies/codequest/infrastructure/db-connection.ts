import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

dotenv.config()

export const connectToDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/codemaster/test'
    console.log(`Successfully connected to ${mongoURI!}`)
  } catch (error) {
    console.log(`Connection to DB failed: ${error}`)
    throw new ConnectionError()
  }
}

export const ConnectionError = class extends Error {}
