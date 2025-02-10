import express from "express";
import { verifyUser } from "../../middleware/verification.js";
import {
  getCategorySales,
  getShopSales,
  getgeneralsales,
  getUserSales,
  payUsercommission,
  makesales,
} from "../controllers/sales-contoller.js";

const route = express.Router();
route.get("/report/category/:categoryId", verifyUser, getCategorySales);
route.get("/report/:shopId", verifyUser, getShopSales);
route.get("/all", verifyUser, getgeneralsales);
route.get("/user/:userId", verifyUser, getUserSales);
route.post("/commission/payment", payUsercommission);
route.post("/items/sale", verifyUser, makesales);
export default route;
