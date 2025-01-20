import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js"
import { APIError, STATUS_CODE } from "../Utils/app-error.js";



class distributionService {
    constructor() {
        this.repository = new InventorymanagementRepository();
        this.shop = new ShopmanagementRepository();
        this.mobile = new phoneinventoryrepository();
    }

    async createnewMobileDistribution(distributionDetails) {
        try {
            const { mainShop, distributedShop, stockId, userId, userName } =
                distributionDetails;

            let parsedQuantity = parseInt(1, 10);
            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                throw new APIError(
                    "distribution error",
                    STATUS_CODE.BAD_REQUEST,
                    "insert a number"
                );

            }

            let [findMainShop, findMiniShop, stockItem] = await Promise.all([
                this.shop.findShop({ name: mainShop }),
                this.shop.findShop({ name: distributedShop }),
                this.mobile.findItem(stockId)
            ]);
            if (!findMainShop || !findMiniShop) {
                throw new APIError(
                    "distribution error",
                    STATUS_CODE.BAD_REQUEST,
                    "shop not found"
                );
            }
            if (!stockItem) {
                throw new APIError(
                    "distribution error",
                    STATUS_CODE.BAD_REQUEST,
                    "stock not found"
                );
            }

            // const shopId = findMainShop._id;
            // const shopToId = findMiniShop._id;

            //distributed shop will be replaced by minishop
            const categoryId = stockItem.CategoryId;
            if (stockItem.stockStatus === "distributed") {
                throw new APIError(
                    "distribution error",
                    STATUS_CODE.BAD_REQUEST,
                    ` mobile product already distibuted`
                );
            } else if (stockItem.stockStatus === "sold") {
                throw new APIError(
                    "distribution error",
                    STATUS_CODE.BAD_REQUEST,
                    "product already sold"
                );
            } else if (stockItem.availableStock === 0) {
                throw new APIError(
                    "distibution error",
                    STATUS_CODE.BAD_REQUEST,
                    "Not enough stock"
                );
            } else if (stockItem.stockStatus === "deleted") {
                throw new APIError(
                    "distribution error",
                    STATUS_CODE.BAD_REQUEST,
                    "product is deleted"
                );
            }
            const newTransfer = {
                quantity: parsedQuantity,
                fromShop: mainShop,
                toShop: distributedShop,
                status: "pending",
                transferdBy: userName,
                type: "distribution",
            };

            stockItem = await this.mobile.updateTransferHistory(stockId, newTransfer);
            stockItem.availableStock = stockItem.availableStock -= parsedQuantity;
            stockItem.stockStatus = "distributed";
            const addedTransfer =
                stockItem.transferHistory[stockItem.transferHistory.length - 1];
            const distributionId = addedTransfer.id;
            //find whether the product exist in the shop
            const existingStock = findMiniShop.phoneItems.find((item) => {
                if (item.stock && item.stock._id) {
                    return item.stock._id.toString() === stockId.toString();
                }
                return false;
            });
            if (existingStock) {
                throw new APIError(
                    "distribution error",
                    STATUS_CODE.BAD_REQUEST,
                    "product already exist"
                );
            } else {
                const addedItem = {
                    productID: stockId,
                    categoryId: categoryId,
                    quantity: 1,
                    status: "pending",
                    transferId: distributionId,
                    productStatus: "new stock",
                };
                const shopId = findMiniShop._id;
                findMiniShop = await this.shop.newAddedphoneItem(shopId, addedItem);
            }

            await this.mobile.saveMobile(stockItem);
            await this.shop.saveShop(findMiniShop);
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
    async createnewAccessoryDistribution(distributionDetails) {
        try {
            const { mainShop, distributedShop, stockId, quantity, userName } =
                distributionDetails;
            let parsedQuantity = parseInt(quantity, 10);
            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                throw new APIError(
                    "distribution error",
                    STATUS_CODE.BAD_REQUEST,
                    "insert a number"
                );
            }
            let [findMainShop, findMiniShop] = await Promise.all([
                this.shop.findShop({ name: mainShop }),
                this.shop.findShop({ name: distributedShop }),
            ]);
            if (!findMainShop || !findMiniShop) {
                throw new APIError(
                    "distribution error",
                    STATUS_CODE.BAD_REQUEST,
                    "shop not found"
                );
            }
            const shopId = findMainShop._id;
            const shopToId = findMiniShop._id;

            //distributed shop will be replaced by minishop

            let stockItem = await this.repository.findProductById(stockId);
            if (!stockItem) {
                throw new APIError(
                    "Stock not found",
                    STATUS_CODE.NOT_FOUND,
                    "The specified stock item does not exist"
                );
            }
            if (stockItem.availableStock < parsedQuantity) {
                throw new APIError(
                    "Insufficient  Accessory  stock",
                    STATUS_CODE.BAD_REQUEST,
                    "Not enough Accessory stock available for distribution"
                );
            }

            const categoryId = stockItem.CategoryId.id;

            const newTransfer = {
                quantity: parsedQuantity,
                fromShop: shopId,
                toShop: shopToId,
                status: "pending",
                tranferdBy: userName,
                type: "distribution",
            };

            stockItem = await this.repository.updateTransferHistory(stockId, newTransfer);
            const addedTransfer =
                stockItem.transferHistory[stockItem.transferHistory.length - 1];
            const distributionId = addedTransfer.id;
            //find whether the product exist in the shop
            const existingStockItem = findMiniShop.stockItems.find((item) => {
                return (
                    item.stock &&
                    item.stock._id &&
                    item.stock._id.toString() === stockId.toString()
                );
            });
            if (existingStockItem) {
                const addedItem = {
                    productID: stockId,
                    quantity: parsedQuantity,
                    fromShop: shopId,
                    categoryId: categoryId,
                    status: "pending",
                    transferId: distributionId,
                    productStatus: "added stock"
                }
                findMiniShop = await this.shop.addNewAccessory(shopToId, addedItem)
            } else {
                const addedItem = {
                    productID: stockId,
                    quantity: parsedQuantity,
                    fromShop: shopId,
                    categoryId: categoryId,
                    status: "pending",
                    transferId: distributionId,
                    productStatus: "new stock",
                };
                findMiniShop = await this.shop.addNewAccessory(shopToId, addedItem);
            }
            stockItem.availableStock -= parsedQuantity;
            await this.repository.saveAccessory(stockItem);
            await this.shop.saveShop(findMiniShop);
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


export { distributionService }