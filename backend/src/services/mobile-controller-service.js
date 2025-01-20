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
    console.log("newPhone", newphoneproduct)
    try {
      const { phoneDetails, financeDetails, user, availableStock } = newphoneproduct
      const {
        CategoryId,
        IMEI,
        serialNumber,
        productcost,
        commission,
        discount,
        color,
        productType,
        supplierName,
        faultyItems,
      } = phoneDetails;

      await this.category.getCategoryById(CategoryId);

      const batchNumber = await this.generateBatchNumber(CategoryId)
      const newProduct = await this.mobile.createphoneStock({
        CategoryId,
        IMEI,
        serialNumber,
        supplierName,
        faultyItems,
        batchNumber,
        productcost,
        commission,
        discount,
        productType,
        color,
        user,
        availableStock,
        financeDetails
      });
      //add product to its category
      const category = await this.category.AddItemInProduct({ id: CategoryId, itemId: newProduct._id });
      const barcodePath = await this.generateAndSaveBarcode(newProduct._id);
      if (!barcodePath) {
        throw new Error("Barcode path is undefined");
      }

      // Add barcode path to the product and save
      newProduct.barcodepath = barcodePath;
      await newProduct.save();

      // Generate the barcode print PDF
      const pdfPath = await this.generateBarcodePDF(newProduct);
      return newProduct;
    } catch (err) {
      console.log(err);
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

      const productComponent = categoryId.slice(0, 5).toUpperCase()
      const batchNumber = `${year}${month}${day}-${hours}${minutes}-${productComponent}`;
      return batchNumber;
    }
    catch (err) {
      throw new APIError(
        "batch number error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal sever error"
      )
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


  async generateAndSaveBarcode(productId) {
    try {
      const barcodeDir = path.join(__dirname, "..", "public", "barcodes");
      await fs.mkdir(barcodeDir, { recursive: true });
      const barcodePath = path.join(barcodeDir, `${productId}.png`);

      await new Promise((resolve, reject) => {
        bwipjs.toBuffer(
          {
            bcid: "code128",
            text: productId.toString(),
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: "center",
          },
          (err, png) => {
            if (err) {
              reject(err);
            } else {
              fs.writeFile(barcodePath, png).then(resolve).catch(reject);
            }
          }
        );
      });
      return barcodePath;
    } catch (error) {
      throw error;
    }
  }

  async generateBarcodePDF(product) {
    try {
      const barcodePath = product.barcodepath;
      if (!barcodePath) {
        throw new Error("Barcode path is undefined");
      }

      const barcodeImage = await fs.readFile(barcodePath);

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([500, 200]);
      const pngImage = await pdfDoc.embedPng(barcodeImage);
      const { width, height } = pngImage.scale(1);

      page.drawText("Product Barcode", {
        x: 50,
        y: 150,
        size: 24,
        color: rgb(0, 0, 0),
      });

      page.drawImage(pngImage, {
        x: (500 - width) / 2,
        y: (200 - height) / 2 - 20,
        width,
        height,
      });

      const pdfBytes = await pdfDoc.save();
      const pdfPath = path.join(
        __dirname,
        "..",
        "public",
        "barcodes",
        `${product._id}-barcode.pdf`
      );
      await fs.writeFile(pdfPath, pdfBytes);
      return pdfPath;
    } catch (error) {
      throw error;
    }
  }

  async confirmDistribution(confirmdeleliverydetails) {
    try {
      const { shopname, userId, productId, quantity, transferId, userName } =
        confirmdeleliverydetails;

      //lets make a  parallel access to the database
      let [mobileProduct, shopFound] = await Promise.all([
        this.mobile.findItem(productId),
        this.shop.findShop({ name: shopname }),
      ]);
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
      } else if (mobileProduct.transferHistory.length === 0) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "NO TRANSFER HISTORY FOUND"
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

      const sellerAssinged = shopFound.sellers.find(
        (seller) => seller._id.toString() === userId.toString()
      );
      if (!sellerAssinged) {
        throw new APIError(
          "Unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "You are not authorized to confirm arrival"
        );
      }
      let transfer = mobileProduct.transferHistory.find((transfer) => {
        return transfer._id.toString() === transferId.toString();
      });
      if (transfer.status === "confirmed") {
        throw new APIError(
          "bad request",
          STATUS_CODE.BAD_REQUEST,
          "product already confirmed"
        )
      }

      if (transfer) {
        transfer.status = "confirmed";
        transfer.confirmedBy = userName;
      } else {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "TRANSFER NOT FOUND"
        );
      }
      //lets filter null productId
      const filterdPhoneItems = shopFound.newPhoneItem.filter((items) => {
        return items.productID !== null
      })
      let newPhone = filterdPhoneItems.find((phone) => {
        return phone.productID.id.toString() === productId.toString();
      });
      if (!newPhone) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "NEW PHONE NOT FOUND"
        );
      }

      if (newPhone.quantity < quantity) {
        throw new APIError(
          "insufficient quantity",
          STATUS_CODE.NOT_FOUND,
          "NOT ENOUGH QUANTITY"
        );
      }
      const newPhoneItem = newPhone.id;
      const updatePhone = await this.shop.updateConfirmationOfProduct(
        shopId,
        newPhoneItem,
        userName
      );

      const confirmedItem = {
        stock: newPhone.productID.id,
        quantity: newPhone.quantity,
        categoryId: newPhone.categoryId,
      };

      if (
        newPhone.productStatus === "new stock" ||
        newPhone.productStatus === "new transfer"
      ) {
        shopFound = await this.shop.addPhoneStock(shopId, confirmedItem);
      } else if (newPhone.productStatus === "return of product") {
        const productFound = shopFound.phoneItems.find((phoneItem) => {
          return phoneItem.id.toString() === newPhone.productID.toString();
        });
        if (productFound) {
          productFound.quantity += newPhone.quantity;
        } else {
          throw new APIError(
            "not found",
            STATUS_CODE.NOT_FOUND,
            "PRODUCT NOT FOUND"
          );
        }
      }
      await this.mobile.saveMobile(mobileProduct);
      await this.shop.saveShop(shopFound);
    } catch (err) {
      console.log("ERERE", err)
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
  async updatePhoneStock(id, updates, userName) {
    try {
      if (!id) {
        throw new APIError(
          "service error",
          STATUS_CODE.BAD_REQUEST,
          "id not found"
        );
      }

      const allowedFields = [
        "IMEI",
        "stockStatus",
        "availableStock",
        "commission",
        "productcost",
        "discount"
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
        id,
        updates,
        userName
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


  async createNewMobileTransfer(transferDetails) {
    try {
      const { mainShop, distributedShop, stockId, quantity, userName } = transferDetails;
      const parsedQuantity = parseInt(quantity, 10);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "please insert a number"
        );
      }
      let [ShopOwningtheItem, ShoptoOwntheItem] = await Promise.all([
        this.shop.findShop({ name: mainShop }),
        this.shop.findShop({ name: distributedShop }),
      ]);
      if (!ShopOwningtheItem || !ShoptoOwntheItem) {
        throw new APIError(
          "Shop not found",
          404,
          "One of the specified shops does not exist"
        );
      }

      const shopId = ShopOwningtheItem._id;
      const shopToId = ShoptoOwntheItem._id;
      //you cannot transfer to the same shop
      if (shopId.toString() === shopToId.toString()) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "you cannot tranfer to the same shop"
        );
      }
      let stockItem = await this.mobile.findItem(stockId);
      //confirm if the stock exist in the shop thats initializing the transfer
      let existingStockItem = await ShopOwningtheItem.phoneItems.find(
        (item) => {
          if (item.stock && item.stock._id) {
            return item.stock._id.toString() === stockId.toString();
          }
          return false;
        }
      );
      if (!existingStockItem) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          `stock not found in ${mainShop}`
        );
      }
      if (existingStockItem.quantity < parsedQuantity) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          `not enough stock to transfer ${parsedQuantity} units`
        );
      }
      existingStockItem.quantity -= parsedQuantity;
      const newTransfer = {
        quantity: parsedQuantity,
        fromShop: mainShop,
        toShop: distributedShop,
        transferdBy: userName,
        status: "pending",
        type: "transfer",
      };
      stockItem = await this.mobile.updateTransferHistory(stockId, newTransfer);

      const addedTransfer =
        stockItem.transferHistory[stockItem.transferHistory.length - 1];
      const distributionId = addedTransfer._id;
      //check if the shop receiving contains the stock
      let shoptoOwntheItemExistingStock =
        await ShoptoOwntheItem.phoneItems.find((item) => {
          if (item.stock && item.stock._id) {
            return item.stock._id.toString() === stockId.toString();
          }
          return false;
        });

      if (!shoptoOwntheItemExistingStock) {
        const phoneDetails = {
          productID: stockId,
          categoryId: stockItem.CategoryId,
          quantity: parsedQuantity,
          status: "pending",
          transferId: distributionId,
          productStatus: "new stock",
        };
        const shopId = ShoptoOwntheItem._id;
        ShoptoOwntheItem = await this.shop.newAddedphoneItem(
          shopId,
          phoneDetails
        );
      } else if (shoptoOwntheItemExistingStock.quantity === 0) {
        const phoneDetails = {
          productID: stockId,
          categoryId: stockItem.CategoryId,
          quantity: parsedQuantity,
          status: "pending",
          transferId: distributionId,
          productStatus: "return of product",
        };
        const shopId = ShoptoOwntheItem._id;
        ShoptoOwntheItem = await this.mobile.updateTransferHistory(
          shopId,
          phoneDetails
        );
      } else {
        throw new APIError(
          "phone inserting error",
          STATUS_CODE.BAD_REQUEST,
          "phone already exist"
        );
      }
      await this.mobile.saveMobile(stockItem);
      await this.shop.saveShop(ShopOwningtheItem);
      await this.shop.saveShop(ShoptoOwntheItem);
    } catch (err) {
      console.log("@@", err);
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
