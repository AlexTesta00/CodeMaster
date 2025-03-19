import express from "express";
import router from "./interfaces/codequest-routes";
import { connectToDatabase } from "./infrastructure/db-connection";
import * as dotenv from 'dotenv'
import { errorHandler } from "./interfaces/error-handler";

dotenv.config();

const app = express()
const port = process.env.PORT!

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//app.use(helmet())

app.use('/codequests', router)
app.use(errorHandler)

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`)
  await connectToDatabase()
})

export { app }