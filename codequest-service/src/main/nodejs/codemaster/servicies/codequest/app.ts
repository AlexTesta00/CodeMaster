import express from "express";
import mongoose from "mongoose";
import router from "./interfaces/routers/codequest-routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/codequests", router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  mongoose.connect('mongodb://mongo:27017/codequests');
});
