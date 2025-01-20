import mongoose from "mongoose";
import config from "../Config/index.js";
const { MONGO_URL } = config;

if (!MONGO_URL) {
  throw new Error('MONGO_URL is not defined');
}
const connectionDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("DB is connected");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

export { connectionDB };
