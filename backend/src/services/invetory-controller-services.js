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
        user,
      } = stockDetails;

      const category = await this.category.getCategoryById(CategoryId);


      // Find if the product exists
      // Create new product
      const batchNumber = await this.generateBatchNumber(CategoryId)
      const newProduct = await this.repository.createnewAccessoryStock({
        CategoryId,
        availableStock,
        stockStatus,
        commission,
        discount,
        productcost,
        faultyItems,
        supplierName,
        user,
        batchNumber
      });
      //add the product to its category
      await this.category.AddItemInProduct({ id: CategoryId, itemId: newProduct._id })
      // Generate and save barcode
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
      console.log("service error", err)
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("service error", STATUS_CODE.INTERNAL_ERROR, err);
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

  // Example usage
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
  async getProductProfile(productId, startdate, endDate) {
    try {
      let StockQuantity = [];
      let sales = [];
      const product = await this.repository.capturespecificproductfordetails({
        id: productId,
      });

      const availableStock = product.availableStock;
      // Get all shop names
      const shopNames = await this.shop.findShopsAvailable();

      const stockQuantityPromises = shopNames.map(async (shop) => {
        const shopFound = await this.shop.findShop({ name: shop.name });

        if (shopFound) {
          const awaitingStockItem = shopFound.newAccessory.filter((item) => {
            return item.productID !== null
          })
          const awaitingStock = awaitingStockItem.find((item) =>
            item.productID.equals(productId)
          )
          const filterdStock = shopFound.stockItems.filter((item) => {
            return item.stock !== null
          })

          const stockItem = filterdStock.find((item) =>
            item.stock.equals(productId)
          );

          if (stockItem) {
            StockQuantity.push({
              shop: shopFound.name,
              quantity: stockItem.quantity,
              status: "confirmed"
            });
          } else if (awaitingStock) {
            StockQuantity.push({
              shop: shopFound.name,
              quantity: awaitingStock.quantity,
              status: "awaiting confirmation"
            })
          } else {
            StockQuantity.push({ shop: shopFound.name, quantity: 0, statuss: "no product" });
          }
        }
      });

      const salesReportPromises = shopNames.map(async (shop) => {
        const salesReport = await this.sales.getProductSalesOnEachShop({
          shopname: shop.name,
          productId: productId.toString(),
          startdate: startdate,
          endDate: endDate,
        });
        if (salesReport) {
          const convertedReport = salesReport.map((report) => ({
            ...report,
            date: new Date(report.date).toLocaleString("en-Us", {
              timezone: "Africa/Nairobi",
            }),
          }));
          sales.push({ shop: shop.name, sales: convertedReport });
        } else {
          sales.push({ shop: shop.name, sales: "no sales yet" });
        }
      });

      await Promise.all(stockQuantityPromises);
      await Promise.all(salesReportPromises);

      const totalSales = sales.reduce((acc, shopSales) => {
        const shopTotalSales = shopSales.sales.reduce(
          (shopAcc, sale) => shopAcc + sale.totalSales,
          0
        );
        return acc + shopTotalSales;
      }, 0);
      console.log("totalSales", totalSales);
      return {
        product,
        StockQuantity,
        sales,
        totalSales: totalSales,
        productQuantity: availableStock,
      };
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

      //lets make a  parallel access to the database
      let [accessoryProduct, shopFound] = await Promise.all([
        this.repository.findProductById(productId),
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
      const CategoryId = accessoryProduct.CategoryId.id;
      const filterdAccessory = shopFound.newAccessory.filter((item) => {
        return item.productID !== null;
      })
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
      const newAccessory = filterdAccessory.find(
        (accessory) => accessory.transferId.toString() === transferId.toString()
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
      const stockItemExist = await shopFound.stockItems?.find((item) => {
        if (item.stock && item.stock._id) {
          return item.stock._id.toString() === productId.toString();
        }
      });
      if (stockItemExist) {
        const updatedStock = await this.shop.updateAccessoryQuantity(
          shopId,
          productId,
          quantity
        )
      } else if (
        newAccessory.productStatus === "new stock" ||
        newAccessory.productStatus === "new transfer"
      ) {
        const confirmedItem = {
          stock: newAccessory.productID.id,
          quantity: newAccessory.quantity,
          categoryId: CategoryId,
        };
        await this.shop.addAcessoryStock(shopId, confirmedItem);
      }
      const updateConfirmationOfAccessory = await this.shop.updateConfirmationOfAccessory(
        shopId,
        newAccessoryId,
        userName
      )


      let transfer = accessoryProduct.transferHistory.find((transfer) => {
        return transfer._id.toString() === transferId.toString();
      });

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
      await this.repository.saveAccessory(accessoryProduct);
      await this.shop.saveShop(shopFound);
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

  async createnewTransfer(transferDetails) {
    try {
      const { mainShop, distributedShop, stockId, quantity, userId, userName } = transferDetails;
      const parsedQuantity = parseInt(quantity, 10);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "please insert a number"
        );
      }
      let [ShopOwningtheItem, ShoptoOwntheItem, stockItem] = await Promise.all([
        this.shop.findShop({ name: mainShop }),
        this.shop.findShop({ name: distributedShop }),
        this.repository.findProductById(stockId)
      ]);
      if (!ShopOwningtheItem || !ShoptoOwntheItem) {
        throw new APIError(
          "Shop not found",
          404,
          "One of the specified shops does not exist"
        );
      }
      if (!stockItem) {
        throw new APIError(
          "product not found",
          STATUS_CODE.NOT_FOUND
        )
      }
      if (stockItem.stockStatus === "deleted" || stockItem.stockStatus === "suspended") {
        throw new APIError(
          "bad request",
          STATUS_CODE.BAD_REQUEST,
          `the product is ${stockItem.stockStatus}`
        )
      }
      const sellerAssinged = ShopOwningtheItem.sellers.find(
        (seller) => seller._id.toString() === userId.toString()
      );
      if (!sellerAssinged) {
        throw new APIError(
          "Unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "You are not authorized to confirm arrival"
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
      //confirm if the stock exist in the shop thats initializing the transfer
      let existingStockItem = await ShopOwningtheItem.stockItems.find(
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
        fromShop: shopId,
        toShop: shopToId,
        transferBy: userName,
        status: "pending",
        type: "transfer",
      };
      stockItem = await this.repository.updateTransferHistory(stockId, newTransfer);
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
        const stockDetails = {
          productID: stockId,
          quantity: parsedQuantity,
          status: "pending",
          transferId: distributionId,
          categoryId: stockItem.CategoryId,
          productStatus: "new stock",
        };
        const shopId = ShoptoOwntheItem._id;
        ShoptoOwntheItem = await this.shop.addNewAccessory(
          shopId,
          stockDetails
        );
      } else if (shoptoOwntheItemExistingStock.quantity === 0) {
        const stockDetails = {
          productID: stockId,
          quantity: parsedQuantity,
          status: "pending",
          transferId: distributionId,
          categoryId: stockItem.CategoryId,
          productStatus: "return of product",
        };
        const shopId = ShoptoOwntheItem._id;
        ShoptoOwntheItem = await this.shop.addNewAccessory(
          shopId,
          stockDetails
        );
      } else {
        throw new APIError(
          "phone inserting error",
          STATUS_CODE.BAD_REQUEST,
          "phone already exist"
        );
      }
      await this.repository.saveAccessory(stockItem);
      await this.shop.saveShop(ShopOwningtheItem);
      await this.shop.saveShop(ShoptoOwntheItem);
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
