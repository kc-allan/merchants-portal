import { APIError, STATUS_CODE } from "../Utils/app-error.js";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";

class transferManagementService {
  constructor() {
    this.mobile = new phoneinventoryrepository();
    this.shop = new ShopmanagementRepository();
    this.repository = new InventorymanagementRepository();
  }
  async createNewMobileTransfer(transferDetails) {
    try {
      const { mainShop, distributedShop, stockId, userId } = transferDetails;
      const parsedQuantity = 1;
      const productId = parseInt(stockId, 10);
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
        this.mobile.findItem(productId)
      ]);
      if (!ShopOwningtheItem || !ShoptoOwntheItem) {
        throw new APIError(
          "Shop not found",
          404,
          "One of the specified shops does not exist"
        );
      }

      const shopId = parseInt(ShopOwningtheItem.id, 10)
      const shopToId = parseInt(ShoptoOwntheItem.id, 10);
      //you cannot transfer to the same shop
      if (shopId === shopToId) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "you cannot tranfer to the same shop"
        );
      }
      if (!stockItem) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "stock not found"
        );
      } else if (stockItem.stockStatus === "faulty") {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "stock is faulty"
        );
      }
      console.log("#$%%^^&", productId)
      //confirm if the stock exist in the shop thats initializing the transfer
      let existingStockItem = ShopOwningtheItem.mobileItems.find(
        (item) => {
          return (item.mobileID === productId) && (item.status === "confirmed");
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
      const updateQuantity = await this.mobile.updateMobileItemsTransfer(existingStockItem.id, parsedQuantity);
      // existingStockItem.quantity -= parsedQuantity;
      const newTransfer = {
        quantity: parsedQuantity,
        fromShop: shopId,
        toShop: shopToId,
        transferdBy: userId,
        status: "pending",
        type: "transfer",
      };
      const newTransferHistory = await this.mobile.createTransferHistory(productId, newTransfer);

      const distributionId = newTransferHistory.id;
      //check if the shop receiving contains the stock
      let shoptoOwntheItemExistingStock =
        ShoptoOwntheItem.mobileItems.find((item) => {
          return item.mobileID === stockId;
        });

      if (!shoptoOwntheItemExistingStock) {
        const phoneDetails = {
          productID: productId,
          categoryId: stockItem.CategoryId,
          quantity: parsedQuantity,
          status: "pending",
          shopID: shopToId,
          transferId: distributionId,
          productStatus: "new stock",
        };
        const shopId = ShoptoOwntheItem.id;
        ShoptoOwntheItem = await this.shop.newAddedphoneItem(
          phoneDetails
        );
      } else if (shoptoOwntheItemExistingStock.quantity === 0) {
        const phoneDetails = {
          productID: stockId,
          categoryId: stockItem.CategoryId,
          quantity: parsedQuantity,
          status: "pending",
          shopID: shopToId,
          transferId: distributionId,
          productStatus: "new stock",
          transferId: distributionId,
          productStatus: "return of product",
        };
        const shopId = ShoptoOwntheItem.id;
        ShoptoOwntheItem = await this.mobile.newAddedphoneItem(
          phoneDetails
        );
      } else {
        throw new APIError(
          "phone inserting error",
          STATUS_CODE.BAD_REQUEST,
          "phone already exist"
        );
      }
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
  async createnewAccessoryTransfer(transferDetails) {
    try {
      const { mainShop, distributedShop, stockId, quantity, userId, userName, transferId } = transferDetails;
      const parsedQuantity = parseInt(quantity, 10);
      const productId = parseInt(stockId, 10);
      const itemTransferId = parseInt(transferId, 10)
      const sellerId = parseInt(userId, 10);
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
        this.repository.findProductById(productId)
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
      const sellerAssinged = ShopOwningtheItem.assignment.find(
        (seller) => seller.actors.id === sellerId
      );
      if (!sellerAssinged) {
        throw new APIError(
          "Unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "You are not authorized to confirm arrival"
        );
      }
      const shopId = parseInt(ShopOwningtheItem.id, 10);
      const shopToId = parseInt(ShoptoOwntheItem.id, 10);
      //you cannot transfer to the same shop
      if (shopId === shopToId) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "you cannot tranfer to the same shop"
        );
      }
      //confirm if the stock exist in the shop thats initializing the transfer

      let existingStockItem = await ShopOwningtheItem.accessoryItems.find(
        (item) => {


          return item.accessoryID === productId && item.transferId === itemTransferId;

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

      const newTransfer = {
        quantity: parsedQuantity,
        fromShop: shopId,
        toShop: shopToId,
        userId: sellerId,
        productId: productId,
        status: "pending",
        type: "transfer",
      };
      let shoptoOwntheItemExistingStock =
        await ShoptoOwntheItem.accessoryItems.filter((item) => {
          return item.accessoryID === productId;

        });

      const AvailableQuantity = shoptoOwntheItemExistingStock?.reduce((acc, item) =>
        acc + item.quantity, 0
      )

      if (!shoptoOwntheItemExistingStock) {
        const newTransferDone = await this.repository.createTransferHistory(stockId, newTransfer)
        const updateQuantity = await this.repository.updateStockQuantityInAshop(existingStockItem.id, parsedQuantity);
        const distributionId = newTransferDone.id;
        const stockDetails = {
          productID: productId,
          quantity: parsedQuantity,
          status: "pending",
          transferId: distributionId,
          productStatus: "new stock",
        };

        ShoptoOwntheItem = await this.shop.addNewAccessory(
          shopToId,
          stockDetails
        );
      } else if (AvailableQuantity < 10) {
        const newTransferDone = await this.repository.createTransferHistory(stockId, newTransfer)
        const updateQuantity = await this.repository.updateStockQuantityInAshop(existingStockItem.id, parsedQuantity);
        const distributionId = newTransferDone.id;
        const stockDetails = {
          productID: productId,
          quantity: parsedQuantity,
          status: "pending",
          transferId: distributionId,
          categoryId: stockItem.CategoryId,
          productStatus: "added sock",
        };

        ShoptoOwntheItem = await this.shop.addNewAccessory(
          shopToId,
          stockDetails
        );
      } else {
        throw new APIError(
          "enough stock already available",
          STATUS_CODE.BAD_REQUEST,
          `nought stock already exist in ${distributedShop}`
        )
      }


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
}

export { transferManagementService };