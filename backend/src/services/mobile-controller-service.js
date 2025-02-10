import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bwipjs from "bwip-js";
import { PDFDocument, rgb } from "pdf-lib";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { Sales } from "../databases/repository/sales-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("file", __filename);
console.log("dirname", __dirname);

class MobilemanagementService {
  constructor() {
    this.mobile = new phoneinventoryrepository();
    this.shop = new ShopmanagementRepository();
    this.category = new CategoryManagementRepository();
    this.sales = new Sales();
  }
  //get product profile
  async createnewPhoneproduct(newphoneproduct) {
    try {
      const { phoneDetails, financeDetails, user, availableStock } =
        newphoneproduct;
      const { CategoryId } = phoneDetails;
      const category = parseInt(CategoryId, 10);
      const categoryExist = await this.category.getCategoryById(category);
      if (!categoryExist) {
        throw new APIError(
          "Invalid category",
          STATUS_CODE.BAD_REQUEST,
          "Invalid category"
        );
      }
      const shopFound = await this.shop.findShop({ name: "Kahawa 2323" });
      if (!shopFound) {
        throw new APIError(
          "Shop not found",
          STATUS_CODE.NOT_FOUND,
          "Shop not found"
        );
      }
      const shopId = shopFound.id;
      const payload = {
        phoneDetails,
        financeDetails,
        shopId,
        user,
      };
      const newProduct = await this.mobile.createPhonewithFinaceDetails(
        payload
      );
      return newProduct;
    } catch (err) {
      // console.log(err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("Service error", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }

  async generateBatchNumber(categoryId) {
    try {
      const now = new Date();

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");

      const productComponent = categoryId.slice(0, 5).toUpperCase();
      const batchNumber = `${year}${month}${day}-${hours}${minutes}-${productComponent}`;
      return batchNumber;
    } catch (err) {
      throw new APIError(
        "batch number error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal sever error"
      );
    }
  }
  async findSpecificMobileProduct(id) {
    try {
      const findSpecificProduct =
        await this.mobile.capturespecificproductfordetails(id);

      return { findSpecificProduct };
    } catch (error) {
      console.error("Error finding specific mobile product:", error);
      throw new APIError(
        "Error finding specific mobile product",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async getproductTransferHistory({ id }) {
    try {
      const transferHiistory =
        await this.mobile.capturespecificproductfortranferhistory({ id });
      return transferHiistory;
    } catch (err) {
      console.log(err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "item service error",
        STATUS_CODE.INTERNAL_ERROR,
        "cannot find item"
      );
    }
  }

  async getproductHistory({ id }) {
    try {
      const history = await this.mobile.capturespecificproductforhistory({
        id,
      });
      if (history.length === 0) {
        throw new APIError(
          "No history found for this product",
          STATUS_CODE.NOT_FOUND,
          "No history found"
        );
      }
      return history;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "item service error",
        STATUS_CODE.INTERNAL_ERROR,
        "cannot find item"
      );
    }
  }

  async confirmDistribution(confirmdeleliverydetails) {
    try {
      const { shopname, userId, stockId, transferID } =
        confirmdeleliverydetails;

      //lets make a  parallel access to the database
      let [mobileProduct, shopFound, transferDetails] = await Promise.all([
        this.mobile.findItem(stockId),
        this.shop.findShop({ name: shopname }),
        this.mobile.findMobileTransferHistory(transferID),
      ]);
      console.log(userId);
      //i have seen it wise if to verify if product exist and verify transfer
      if (!mobileProduct) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "PRODUCT NOT FOUND"
        );
      } else if (mobileProduct.stockStatus === "deleted") {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "PRODUCT IS DELETED"
        );
      } else if (mobileProduct.stockStatus === "sold") {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "PRODUCT IS SOLD"
        );
      }
      if (!transferDetails) {
        throw new APIError(
          "not found",
          STATUS_CODE.BAD_REQUEST,
          "TRANSFER HISTORY NOT FOUND"
        );
      }
      if (transferDetails.status === "confirmed") {
        throw new APIError(
          "already confirmed",
          STATUS_CODE.BAD_REQUEST,
          "product already confirmed"
        );
      }
      if (transferDetails.productID !== stockId) {
        throw new APIError(
          "mismatch error",
          STATUS_CODE.BAD_REQUEST,
          "appears a mismatch on productid"
        );
      }
      if (!shopFound) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "SHOP NOT FOUND"
        );
      }
      const shopId = shopFound.id;

      const sellerAssinged = shopFound.assignment.find((seller) => {
        return seller.actors.id === userId && seller.status === "assigned";
      });
      if (!sellerAssinged) {
        throw new APIError(
          "Unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "You are not authorized to confirm arrival"
        );
      }
      //update  transfer history table data
      const distributionData = {
        id: transferID,
        status: "confirmed",
        userId: userId,
      };
      //update mobileItems table data
      const confirmedData = {
        shopId: shopId,
        transferId: transferID,
        userId: userId,
        status: "confirmed",
      };
      await Promise.all([
        this.mobile.updateConfirmedmobileItem(confirmedData),
        this.mobile.updatetransferHistory(distributionData),
      ]);
    } catch (err) {
      console.log("ERERE", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Distribution service error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }
  async updatePhoneStock(id, updates, userId) {
    try {
      if (!id) {
        throw new APIError(
          "service error",
          STATUS_CODE.BAD_REQUEST,
          "id not found"
        );
      }
      const shopFound = await this.shop.findShop({ name: "Kahawa 2323" });
      if (!shopFound) {
        throw new APIError(
          "Shop not found",
          STATUS_CODE.NOT_FOUND,
          "Shop not found"
        );
      }
      const shopId = shopFound.id;
      const mobileId = parseInt(id, 10);
      const user = parseInt(userId, 10);
      const allowedFields = [
        "IMEI",
        "stockStatus",
        "availableStock",
        "commission",
        "productcost",
        "discount",
      ];
      const validateUpdateField = Object.keys(updates).filter((key) =>
        allowedFields.includes(key)
      );
      if (validateUpdateField.length === 0) {
        throw new APIError(
          "service error",
          STATUS_CODE.BAD_REQUEST,
          "Invalid update fields"
        );
      }
      // Update the phone stock
      const updatedPhone = await this.mobile.updatethephoneStock(
        mobileId,
        updates,
        user,
        shopId
      );

      return updatedPhone;
    } catch (err) {
      console.log(err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to update phone stock"
      );
    }
  }

  async findAllMobileAccessory(page, limit) {
    try {
      const { stockAvailable, totalItems } =
        await this.mobile.findAllMobileStockAvailable(page, limit);
      const filterdItem = stockAvailable.filter(
        (item) =>
          item !== null ||
          item.history !== null ||
          item.stockStatus === "Deleted"
      );
      return { filterdItem, totalItems, page, limit };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "item service error",
        STATUS_CODE.INTERNAL_ERROR,
        "cannot find item"
      );
    }
  }

  //it won't do the actuall deletion but instead an update of
  //stock status
  async createAnewSoftDeletion(itemId) {
    try {
      const deletedItem = await this.mobile.softcopyofphoneItem({ id: itemId });
      return deletedItem;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Distribution service error",
        STATUS_CODE.INTERNAL_ERROR,
        err
      );
    }
  }

  async searchForMobile(searchItem) {
    try {
      console.log("searchItem", searchItem);
      const searchResult = await this.mobile.searchMobileProducts(searchItem);
      return searchResult;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("search error", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }
}

export { MobilemanagementService };
