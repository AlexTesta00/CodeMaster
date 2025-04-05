import express from "express";
import router from "./codequest-routes";
import { errorHandler } from "./error-handler";
import helmet from "helmet";

const app = express()
const port = process.env.PORT!

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())

app.use('/codequests', router)
app.use(errorHandler)

export { app }