import express from "express";
import session from "express-session";
import MySQLStore from 'express-mysql-session';
import morgan from "morgan";
import cookies from "cookie-parser";
import { ErrorHandler } from "./Utils/error-handler.js";
import inventoryRoutes from "./Api/routes/inventory-management-routes.js";
import searchroutes from "./Api/routes/search-management-route.js";
import shoproutes from "./Api/routes/shop-inventory-routes.js";
import userRoutes from "./Api/routes/usermanagement-routes.js";
import transferRoutes from "./Api/routes/transfer-management-routes.js"
import distributionRoutes from "./Api/routes/distribution-management-route.js";
import mobileRoutes from "./Api/routes/mobile-management-routes.js";
import salesroute from "./Api/routes/salesroutes.js";
import categoryRoutes from "./Api/routes/category-management-routes.js";
import config from "./Config/index.js";
const { APP_SECRET, MONGO_URL } = config;
import path from "path";
import { fileURLToPath } from "url";
import expressEjsLayouts from "express-ejs-layouts";
import dotenv from "dotenv";
import cors from "cors";
import { verifyUser } from "./middleware/verification.js";

dotenv.config();
//session
const MySQLStoreSession = MySQLStore(session);

const sessionStore = new MySQLStoreSession({
  host: 'localhost', // MySQL host
  port: 3306, // MySQL port
  user: 'root', // MySQL username
  password: 'Faith@2007', // MySQL password
  database: 'captech', // MySQL database name
  createDatabaseTable: true, // Create sessions table if it doesn't exist
  schema: {
    tableName: 'sessions', // Name of the sessions table
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data',
    },
  },
});


sessionStore.on("error", function (error) {
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
      origin: ["*", "http://localhost:4422", "http://localhost:3000"],
      credentials: true,
    })
  );

  //setup session
  app.use(
    session({
      secret: 'captecstoresession',
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      },
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
  app.use("/api/transfer", transferRoutes)
  app.use("/api/status", (req, res) => {
    res.status(200).json({ message: "Server is up and running" });
  });
  app.use("/api/auth/verify", verifyUser, (req, res) => {
    res.status(200).json({ message: "User is verified" });
  });
  app.use(ErrorHandler);
};

export { App };
