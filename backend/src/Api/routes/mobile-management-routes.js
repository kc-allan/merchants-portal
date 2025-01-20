import express from "express";
import { verifyUser } from "../../middleware/verification.js";
import {
  addNewPhoneProduct,
  //updatePhoneStock,
  findAllMobileAccessoryProduct,
  createnewMobileTransfer,
  findSpecificMobileProduct,
  createanewsoftdeleteoftheproduct,
  createnewproductupdate,
  downloadQRCODE,
  findSpecificProductTransferHistory,
  findSpecificProductHistory,
  confirmphonearrival,
  createProduct
} from "../controllers/mobile-management-controller.js";
const route = express.Router();
route.get("/mobile", verifyUser, findAllMobileAccessoryProduct);
route.get("/profile/mobile/:id", verifyUser, findSpecificMobileProduct);
route.get("/mobile/item/history/:id", findSpecificProductHistory);
route.get(
  "/mobile/item/transferhistory/:id",
  findSpecificProductTransferHistory
);
route.get("/download/:productId/barcode", downloadQRCODE);
route.post("/add-phone-stock", verifyUser, addNewPhoneProduct);
route.post("/create-phone-stock", verifyUser, createProduct)

route.post("/create-phone-transfer", verifyUser, createnewMobileTransfer);
route.delete(
  "/create-phone-deletion/:id",
  verifyUser,
  createanewsoftdeleteoftheproduct
);
route.post("/confirm/phone/", verifyUser, confirmphonearrival);
//route.put("/update-phone-stock", verifyUser, updatePhoneStock);
route.put("/update-phone-product/:id", verifyUser, createnewproductupdate);
export default route;
