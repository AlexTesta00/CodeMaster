import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

dotenv.config()

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!) //TODO: Tech Debit
    console.log(`Successfully connected to ${process.env.MONGO_URI!}`)
  } catch (error) {
    console.log(`Connection to DB failed: ${error}`)
    throw new ConnectionError()
  }
}

export const isDatabaseConnected = (): boolean => mongoose.connection.readyState === 1

export const ConnectionError = class extends Error {}
