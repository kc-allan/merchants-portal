import express from "express";
import { verifyUser } from "../../middleware/verification.js"
import { getCategorySales, getShopSales, getgeneralsales, getUserSales, payUsercommission, makesales, downloadSalePdf, downloadGeneralSales } from "../controllers/sales-contoller.js"

const route = express.Router()
route.get("/report/category/:categoryId", verifyUser, getCategorySales)
route.get("/report/:shopname", verifyUser, getShopSales)
route.get("/all", verifyUser, getgeneralsales)
route.get("/download/:name", downloadSalePdf)
route.get("/generalsales/download", downloadGeneralSales)
route.get("/user/:userId", verifyUser, getUserSales)
route.post("/commission/payment", payUsercommission)
route.post("/items/sale", verifyUser, makesales)
export default route;
