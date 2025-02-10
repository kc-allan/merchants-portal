import express from "express";
import { App } from "./express-app.js";
import { connectionDB } from "./databases/connectionDB.js";
import dotEnv from "dotenv"

dotEnv.config()


const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'
const startServer = async () => {
  const app = express()
  await App(app);
  app
    .listen(PORT, HOST, () => {
      console.log(`server is running on port ${PORT}`);
    })
    .on("error", (err) => {
      console.log(err);
      process.exit(1);
    });
};

startServer();
