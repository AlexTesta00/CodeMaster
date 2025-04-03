import {connectToDatabase} from "./infrastructure/db-connection";
import {app} from "./interfaces/app";
import * as dotenv from 'dotenv'

dotenv.config();
const port = process.env.PORT!

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`)
    await connectToDatabase()
})