import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bwipjs from "bwip-js";
import { PDFDocument, rgb } from "pdf-lib";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
import { Sales } from "../databases/repository/sales-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InvetorymanagementService {
  constructor() {
    this.repository = new InventorymanagementRepository();
    this.shop = new ShopmanagementRepository();
    this.category = new CategoryManagementRepository();
    this.sales = new Sales();
  }
  async createnewproduct(stockDetails) {
    try {
      const {
        CategoryId,
        availableStock,
        commission,
        discount,
        productcost,
        faultyItems,
        stockStatus,
        supplierName,
        batchNumber,
        productType,
        user,
      } = stockDetails;
      const categoryId = parseInt(CategoryId, 10)

      const category = await this.category.getCategoryById(categoryId);
      if (!category) {
        throw new APIError(
          "Invalid category",
          STATUS_CODE.BAD_REQUEST,
          "Invalid category id"
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
      const accessoryDetails = {
        categoryId,
        availableStock,
        stockStatus,
        commission,
        discount,
        productcost,
        faultyItems,
        supplierName,
        productType,

        batchNumber
      }
      const payload = {
        accessoryDetails,
        user,
        shopId
      }
      const newProduct = await this.repository.createAccesoryProduct(
        { accessoryDetails, user, shopId }
      );
      //add the product to its category
      return newProduct;
    } catch (err) {
      console.log("service error", err)
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("service error", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }


  // Example usage



  async getProductProfile(productId) {
    try {
      //   const confirmedStock = presentShops.filter(
      //     (shop) => shop.stockStatus === "confirmed"
      //   ) 
      //  const  pendingStock = presentShops.filter(
      //     (shop) => shop.stockStatus === "pending"
      //   );
      const product = await this.repository.findProductById(
        productId,
      );
      return product;

    } catch (err) {
      console.log("serviceerrr", err)
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("service error", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }



  async getproductTransferHistory({ id, page, limit }) {
    try {
      const transferHistory =
        await this.repository.capturespecificproductfortransferhistory({
          id,
          page,
          limit,
        });
      if (transferHistory.length === 0) {
        throw new APIError(
          "No transfer history found for this product",
          STATUS_CODE.NOT_FOUND,
          "product transfer history not found"
        );
      }
      return transferHistory;
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

  async getproductHistory({ id, page, limit }) {
    try {
      const history = await this.repository.capturespecificproductforhistory({
        id,
        page,
        limit,
      });
      if (history.length === 0) {
        throw new APIError(
          "No history found for this product",
          STATUS_CODE.NOT_FOUND,
          "product history not found"
        );
      }
      return history;
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

  //findnew stock available

  async findAllAccessory(page, limit) {
    try {
      const { stockAvailable, totalItems } =
        await this.repository.findAllStockAcessoryAvailable(page, limit);
      const filterdItem = stockAvailable.filter(
        (item) => item !== null || item.history !== null
      );
      return { filterdItem, totalItems, page, limit };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "item service error",
        STATUS_CODE.INTERNAL_ERROR, x
      );
    }
  }

  //findspecific accessory product

  async findSpecificProduct({ id }) {
    try {
      const findSpecificProduct =
        await this.repository.capturespecificproductfordetails({ id });
      return findSpecificProduct;
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
      const { shopname, userId, productId, quantity, transferId, userName } =
        confirmdeleliverydetails;
      const stockId = parseInt(productId, 10);
      const transferproductId = parseInt(transferId, 10);
      const parsedQuanity = parseInt(quantity);
      //lets make a  parallel access to the database
      let [accessoryProduct, shopFound] = await Promise.all([
        this.repository.findProductById(stockId),
        this.shop.findShop({ name: shopname }),
      ]);
      if (!accessoryProduct) {
        throw new APIError(
          "Product not found",
          STATUS_CODE.NOT_FOUND,
          "Product not found"
        );
      }
      if (accessoryProduct.stockStatus === "deleted" || accessoryProduct.stockStatus === "suspended") {
        throw new APIError(
          "Bad Request",
          STATUS_CODE.BAD_REQUEST,
          `this product is ${accessoryProduct.stockStatus}`
        )
      }
      if (!shopFound) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "SHOP NOT FOUND"
        );
      }

      const filterdAccessory = shopFound.accessoryItems.filter((item) => {
        return item.accessoryID !== null;
      })
      const shopId = shopFound.id;
      const sellerAssinged = shopFound.assignment.find(
        (seller) => seller.actors.id === userId
      );
      if (!sellerAssinged) {
        throw new APIError(
          "Unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "You are not authorized to confirm arrival"
        );
      }
      const newAccessory = filterdAccessory.find(
        (accessory) => accessory.transferId === transferproductId
      );

      const newAccessoryId = newAccessory.id;

      if (!newAccessory) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          " NEW ACCESSORY  NOT FOUND"
        );
      }

      if (newAccessory.status === "confirmed") {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "ACCESSORY ALREADY CONFIRMED"
        );
      }
      if (newAccessory.quantity < quantity) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "NOT ENOUGH QUANTITY"
        );
      }
      const updates = {
        status: "confirmed",
        confirmedBy: userId,
        updatedAt: new Date()
      }
      const updateTransferHistory = await this.repository.updateTransferHistory(transferproductId, updates)
      const updateConfirmationOfAccessory = await this.shop.updateConfirmationOfAccessory(
        shopId,
        transferproductId,
        userId
      )
    } catch (err) {
      console.log("##service err", err)
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

  async updateProduct(id, updates) {
    try {
      if (!id) {
        throw new APIError(
          "update error",
          STATUS_CODE.BAD_REQUEST,
          "product id not found"
        );
      }

      // Validate the updates object to ensure only allowed fields are updated
      //this will for sure check for integrity for the data we pass
      const allowedFields = [
        "availableStock",
        "commission",
        "productcost",
        "discount",
        "stockStatus"
      ];
      //the object.keys()  will extract keys in the updates argument passed
      //the filter method will check if the updates property are legit
      const validUpdates = Object.keys(updates).filter((key) =>
        allowedFields.includes(key)
      );
      if (validUpdates.length === 0) {
        throw new APIError(
          "Update Error",
          STATUS_CODE.BAD_REQUEST,
          "no properties to update"
        );
      }
      return await this.repository.updateProductById(id, updates);
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "service error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async searchForAccessory(searchItem) {
    try {
      console.log("searchItem", searchItem);
      const searchResult = await this.repository.searchAccessoryProducts(
        searchItem
      );
      return searchResult;
    } catch (err) {
      console.log(err)
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("search error", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }
}

export { InvetorymanagementService };
