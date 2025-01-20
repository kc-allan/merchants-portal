import express from "express";
import searchProduct from "../controllers/search-management-controller.js";
const route = express.Router();

route.post("/products", searchProduct);

export default route;
