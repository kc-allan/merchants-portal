import express from "express";
import { verifyUser } from "../../middleware/verification.js";
import {
  createShop,
  getSpecificShop,
  findSpecificShopItem,
  updateShop,
  addassignment,
  removeAssignment,
  getAllShops,
  searchproduct,
} from "../controllers/shop-management-controller.js";

const route = express.Router();

route.post("/create-shop", verifyUser, createShop);
route.get("/all", getAllShops);
route.get("/:name", getSpecificShop);
route.get("/searchproducts/:shopName", searchproduct);
route.get("/:name/:requestedItem", findSpecificShopItem);
route.post("/assignment/add", verifyUser, addassignment);
route.post("/assignment/remove", verifyUser, removeAssignment);
route.put("/update/:id", updateShop);

export default route;
