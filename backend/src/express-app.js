import express from "express";
import session from "express-session";
import morgan from "morgan";
import cookies from "cookie-parser";
import { ErrorHandler } from "./Utils/error-handler.js";
import inventoryRoutes from "./Api/routes/inventory-management-routes.js";
import searchroutes from "./Api/routes/search-management-route.js";
import shoproutes from "./Api/routes/shop-inventory-routes.js";
import userRoutes from "./Api/routes/usermanagement-routes.js";
import distributionRoutes from "./Api/routes/distribution-management-route.js";
import mobileRoutes from "./Api/routes/mobile-management-routes.js";
import salesroute from "./Api/routes/salesroutes.js";
import categoryRoutes from "./Api/routes/category-management-route.js";
import config from "./Config/index.js";
import MongoDBStore from "connect-mongodb-session";
const { APP_SECRET, MONGO_URL } = config;
import path from "path";
import { fileURLToPath } from "url";
import expressEjsLayouts from "express-ejs-layouts";
import dotenv from "dotenv";
import cors from "cors";
import { verifyUser } from "./middleware/verification.js";

dotenv.config();
//session
const MongoDBStoreSession = MongoDBStore(session);
const store = new MongoDBStoreSession({
  uri: MONGO_URL,
  collection: "sessions",
});

store.on("error", function (error) {
  assert.ifError(error);
  assert.ok(false);
});

const app = express();
// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const App = async (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(morgan("dev"));
  //SET COOKIES
  app.use(cookies("captecstoresession"));
  // Set EJS as the view engine
  app.use(expressEjsLayouts);
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.set("layout", "layouts/main");

  // Enable CORS
  app.use(
    cors({
      origin: ["*", "http://localhost:4422", "https://captech.netlify.app", "https://6z8nc489-4422.euw.devtunnels.ms"],
      credentials: true,
    })
  );

  //setup session
  app.use(
    session({
      secret: APP_SECRET,
      saveUninitialized: true,
      resave: false,
      store: store,
    })
  );

  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/inventory", mobileRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/shop", shoproutes);
  app.use("/api/sales", salesroute);
  app.use("/api/category", categoryRoutes);
  app.use("/api/search", searchroutes);
  app.use("/api/distribution", distributionRoutes);
  app.use("/api/status", (req, res) => {
    res.status(200).json({ message: "Server is up and running" });
  });
  app.use("/api/auth/verify", verifyUser, (req, res) => {
    res.status(200).json({ message: "User is verified" });
  });
  app.use(ErrorHandler);
};

export { App };
