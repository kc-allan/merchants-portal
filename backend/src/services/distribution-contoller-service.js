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
            const { mainShop, distributedShop, stockId, userId } =
                distributionDetails;
            const productId = parseInt(stockId, 10);
            const userID = parseInt(userId, 10);
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
                this.mobile.findItem(productId)
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

            const shopId = findMainShop.id;
            const shopToId = findMiniShop.id;

            //distributed shop will be replaced by minishop
            const categoryId = stockItem.CategoryId
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
                fromShop: shopId,
                toShop: shopToId,
                status: "pending",
                transferdBy: userId,
                type: "distribution",
            };

            const stockTransferHistory = await this.mobile.createTransferHistory(productId, newTransfer);
            console.log("stock", stockTransferHistory)
            const distributionData = {
                quantity: parsedQuantity,
                status: "distributed"
            }
            await this.mobile.updateMobileDistributionStatusQuantity(productId, distributionData);

            const distributionId = stockTransferHistory.id;
            //find whether the product exist in the shop
            const existingStock = findMiniShop.mobileItems.find((item) => {

                return item.mobileID === productId;

            });
            if (existingStock) {
                throw new APIError(
                    "distribution error",
                    STATUS_CODE.BAD_REQUEST,
                    "product already exist"
                );
            } else {
                const newItem = {
                    productID: productId,
                    categoryId: categoryId,
                    quantity: 1,
                    shopID: shopToId,
                    status: "pending",
                    transferId: distributionId,
                    productStatus: "new stock",
                };
                const shopId = findMiniShop._id;
                findMiniShop = await this.shop.newAddedphoneItem(newItem);
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
    async createnewAccessoryDistribution(distributionDetails) {
        try {
            const { mainShop, distributedShop, stockId, quantity, userId } =
                distributionDetails;
            let parsedQuantity = parseInt(quantity, 10);
            let productId = parseInt(stockId, 10)
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
            const shopId = parseInt(findMainShop.id, 10);
            const shopToId = parseInt(findMiniShop.id, 10);

            let stockItem = await this.repository.findProductById(productId);
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
                productId: productId,
                status: "pending",
                userId: userId,
                type: "distribution",
            };

            const newTransferHistory = await this.repository.createTransferHistory(stockId, newTransfer);

            const distributionId = newTransferHistory.id;
            //find whether the product exist in the shop
            const existingStockItem = findMiniShop.accessoryItems.find((item) => {
                return (

                    item.accessoryID === productId
                );
            });
            if (existingStockItem) {
                const addedItem = {
                    productID: productId,
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
                    productID: productId,
                    quantity: parsedQuantity,
                    fromShop: shopId,
                    categoryId: categoryId,
                    status: "pending",
                    transferId: distributionId,
                    productStatus: "new stock",
                };
                findMiniShop = await this.shop.addNewAccessory(shopToId, addedItem);
            }
            const updateQuantity = await this.repository.updateStockQuantity(productId, parsedQuantity)

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