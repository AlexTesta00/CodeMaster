import express from "express";
import helmet from "helmet";
import {connectToDatabase} from "./infrastructure/db-connection";
import {router} from "./interfaces/authentication-routes";
import {errorHandler} from "./interfaces/error-handler";

const app = express();
const port = process.env.PORT!;

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(helmet());

app.use("/authentication", router);
app.use(errorHandler);

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await connectToDatabase();
});