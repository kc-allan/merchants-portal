import express from "express";
import { verifyUser } from "../../middleware/verification.js";
import {
  createnewstock,
  confirmarrival,
  findAllAccessoryProduct,
  getProductProfile,
  createnewTransfer,
  findSpecificProductHistory,
  findSpecificProductTransferHistory,
  updateStock,
} from "../controllers/inventory-management-controller.js";
const route = express.Router();
route.get("/profile/accessory/:id", verifyUser, getProductProfile);
route.get("/accessory/item/history/:id", findSpecificProductHistory);
route.get(
  "/accessory/item/transferhistory/:id",
  findSpecificProductTransferHistory
);

route.get("/accessory", verifyUser, findAllAccessoryProduct);
route.post("/create-stock", verifyUser, createnewstock);
route.post("/accessory/create-transfer", verifyUser, createnewTransfer);
route.post(
  "/accessory/confirm-distribution",
  verifyUser,
  confirmarrival
);
route.post("/updatestock/:id", updateStock);
export default route;
