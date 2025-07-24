import mongoose from 'mongoose'

const serverTimeout = 5000

export const connectToDatabase = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI ??
      'mongodb://mongo-authentication:27017/codemaster-authentication-db-test'
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: serverTimeout,
    })
    console.log(`Successfully connected to ${mongoURI}`)
  } catch (error) {
    console.log(`Connection to DB failed ${error}`)
    throw new ConnectionError()
  }
}

export const isDatabaseConnected = (): boolean => mongoose.connection.readyState === 1

export const ConnectionError = class extends Error {}
