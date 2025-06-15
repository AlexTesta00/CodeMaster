import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

dotenv.config()
const serverTimeout = 5000

export class MongoConnector {
  static async connectToDatabase() {
    try {
      const mongoURI =
        process.env.MONGO_URI ?? 'mongodb://localhost:27017/codemaster/test'
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: serverTimeout,
      })
      console.log(`Successfully connected to ${mongoURI}`)
    } catch (error) {
      console.log(`Connection to DB failed ${error}`)
      throw new ConnectionError()
    }
  }

  static isDatabaseConnected() {
    return mongoose.connection.readyState === 1
  }
}

export const ConnectionError = class extends Error {}
