// databases/repository/invetory-controller-repository.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

class InventorymanagementRepository {
  async createAccesoryProduct({ accessoryDetails, user, shopId }) {
    try {

      console.log("accessory2324", accessoryDetails)
      const newAccessory = await this.createnewAccessoryStock(accessoryDetails);
      await this.createHistory({
        shopId,
        user,
        productId: newAccessory.id,
        quantity: accessoryDetails.availableStock,
        type: "new stock",
      });
    } catch (err) {
      console.log("service error", err);
      throw new APIError(
        "creating product error",
        STATUS_CODE.INTERNAL_ERROR,
        err || "internal server error"
      );
    }
  }
  async createnewAccessoryStock(accessoryDetails) {
    try {
      const { categoryId,
        availableStock,
        commission,
        discount,
        productcost,
        faultyItems,
        supplierName,
        productType,
        stockStatus,
        batchNumber } = accessoryDetails
      const newAccessory = await prisma.accessories.create({
        data: {
          CategoryId: categoryId,
          batchNumber: batchNumber,
          availableStock: availableStock,
          discount: discount,
          commission: commission,
          productCost: productcost,
          faultyItems: faultyItems,
          supplierName: supplierName,
          productType: productType,
          stockStatus: stockStatus,
        }
      });
      return newAccessory;
    } catch (err) {
      console.log("service error", err);
      throw new APIError(
        "creating product error",
        STATUS_CODE.INTERNAL_ERROR,
        err || "internal server error"
      );
    }
  }
  async createHistory({ productId, user, type, shopId, quantity }) {
    try {
      const createHistory = await prisma.accessoryHistory.create({
        data: {
          productID: productId,
          type: type,
          shopId: shopId,
          addedBy: user,
          quantity: quantity,
        },
      });
      return createHistory;
    } catch (err) {
      console.log("err", err)
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  //update the sales of the accessory produtct
  async updateSalesAccessoryStock({ id, quantity, shopId, sellerId }) {
    try {
      const updatedSalesoftheAccessory = await prisma.accessoryHistory.create({
        data: {
          productID: id,
          quantity: quantity,
          shopId: shopId,
          addedBy: sellerId,
        },
      });
      return updatedSalesoftheAccessory;
    } catch (err) {
      console.log("updateError", err);
      throw new APIError(
        "internal server error",
        STATUS_CODE.INTERNAL_ERROR,
        err || "internal server error"
      );
    }
  }

  //update the accessory stock
  async updatetheAccessoryStock({ id, availableStock }) {
    try {
      //we update the stock available
      const updateStock = await prisma.accessories.update({
        where: {
          id: id,
        },
        data: {
          availableStock: {
            increment: availableStock,
          },
        },
      });
    } catch (err) {
      console.log("updateError", err);
      throw new APIError(
        "internal server error",
        STATUS_CODE.INTERNAL_ERROR,
        err || "internal server error"
      );
    }
  }
  async findProductById(id) {
    try {
      const findItem = await prisma.accessories.findUnique({
        where: {
          id: id,
        },
        include: {
          categories: {
            select: {
              itemName: true,
              itemModel: true,
              brand: true,
              minPrice: true,
              maxPrice: true,
              itemType: true,
            },
          },
        },
      });
      return findItem;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to find the item"
      );
    }
  }
  async findAvailableStockInShop(productId) {
    try {
      const availableStock = await prisma.accessoryItems.findMany({
        where: {
          accessoryID: productId
        },
        include: {
          shops: {
            select: {
              shopName: true
            }
          }
        }
      })
      return availableStock
    } catch (err) {
      console.log("serviceerrr", err)
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("service error", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }
  //find all accessory items to list them

  async findAllStockAcessoryAvailable(page, limit) {
    try {
      const stockAvailable = await prisma.accessories.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
          stockStatus: true,
          productCost: true,
          color: true,
          commission: true,
          discount: true,
          batchNumber: true,
          supplierName: true,
          CategoryId: true,
          productType: true,
          availableStock: true,
          updatedAt: true,
          createdAt: true,
          categories: {
            select: {
              itemName: true,
              itemModel: true,
              brand: true,
              minPrice: true,
              maxPrice: true,
            },
          },
        },
      });

      // Get the total count of available stock
      const itemsAvailable = await prisma.accessories.findMany({
        where: {
          stockStatus: "available",
        },
      });
      const totalItems = itemsAvailable.reduce(
        (acc, item) => acc + item.availableStock,
        0
      );

      return { stockAvailable, totalItems };
    } catch (err) {
      console.log("err", err)
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("databaseERROR", STATUS_CODE.INTERNAL_ERROR);
    }
  }

  async capturespecificproductfortransferhistory({ id, page, limit }) {
    try {
      const productId = parseInt(id, 10);
      const productFound = await prisma.accessorytransferhistory.findMany({
        where: {
          productID: productId,
        },
        select: {
          shops_accessorytransferhistory_fromshopToshops: {
            select: {
              shopName: true,
            },
          },
          shops_accessorytransferhistory_toshopToshops: {
            select: {
              shopName: true,
            },
          },
          actors_accessorytransferhistory_confirmedByToactors: {
            select: {
              name: true,
            },
          },
          actors_accessorytransferhistory_transferdByToactors: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!productFound) {
        throw new APIError("not found", STATUS_CODE.NOT_FOUND, "not found");
      }
      return productFound;
    } catch (err) {
      // console.log("service error", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "databaseERROR",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async capturespecificproductforhistory({ id, page, limit }) {
    try {

      const productId = parseInt(id, 10);
      const productHistoryFound = await prisma.accessoryHistory.findMany({
        where: {
          productID: productId,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          id: "desc",
        },
        include: {
          actors: {
            select: {
              name: true,
              email: true
            }
          },
          shops: {
            select: {
              shopName: true,
              address: true,
            },
          }

        }
      });
      if (!productHistoryFound) {
        throw new APIError("not found", STATUS_CODE.NOT_FOUND, "not found");
      }
      return productHistoryFound;
    } catch (err) {
      console.log(err)
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "databaseERROR",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async createTransferHistory(id, transferData) {
    try {
      const createdTransferHistory = await prisma.accessorytransferhistory.create({
        data: {
          quantity: transferData.quantity,
          status: transferData.status,
          type: transferData.type,
          shops_accessorytransferhistory_fromshopToshops: {
            connect: { id: transferData.fromShop },
          },
          shops_accessorytransferhistory_toshopToshops: {
            connect: { id: transferData.toShop },
          },
          actors_accessorytransferhistory_transferdByToactors: {
            connect: { id: transferData.userId },
          },
          accessories: {
            connect: { id: transferData.productId },
          },
        },
      });
      return createdTransferHistory;
    } catch (err) {
      console.log("err", err);
      throw new APIError(
        "database transfer error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async updateStockQuantity(productId, quantity) {
    try {
      //decrement quantity
      const updateQuantity = await prisma.accessories.update({
        where: {
          id: productId,
        },
        data: {
          availableStock: {
            decrement: quantity,
          },
        },
      });
    } catch (err) {
      throw new APIError(
        "database update error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      )
    }
  }
  async updateStockQuantityInAshop(id, quatity) {
    try {
      const updateQuantity = await prisma.accessoryItems.update({
        where: {
          id: id,
        },
        data: {
          quantity: {
            decrement: quatity,
          },
        },
      });
    } catch (err) {
      throw new APIError(
        "database update error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      )
    }
  }
  async updateTransferHistory(id, updates) {
    try {
      const updatedTransferHistory = await prisma.accessorytransferhistory.update({
        where: {
          id: id,
        },
        data: updates,
      });
      return updatedTransferHistory;
    }

    catch (err) {
      throw new APIError(
        "update error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      )
    }
  }
  async searchAccessories(searchItem) {
    try {
      const lowercaseSearchItem = searchItem.toLowerCase();

      const batchNumberMatches = await prisma.accessories.findMany({
        where: {
          batchNumber: {
            contains: lowercaseSearchItem,
          },
        },
        select: {
          id: true,
          batchNumber: true,
          availableStock: true,
          productCost: true,
          commission: true,
          discount: true,
          stockStatus: true,
          color: true,
          categories: {
            select: {
              itemName: true,
              itemModel: true,
              brand: true,
            },
          },
        },
      });
      const categoryMatches = await prisma.accessories.findMany({
        where: {
          categories: {
            OR: [
              { itemName: { contains: lowercaseSearchItem } },
              { itemModel: { contains: lowercaseSearchItem } },
              { brand: { contains: lowercaseSearchItem } },
            ],
          },
        },
        select: {
          id: true,
          batchNumber: true,
          availableStock: true,
          productCost: true,
          commission: true,
          discount: true,
          stockStatus: true,
          color: true,
          categories: {
            select: {
              itemName: true,
              itemModel: true,
              brand: true,
            },
          },
        },
      });

      // Step 3: Combine the results
      const combinedResults = [...batchNumberMatches, ...categoryMatches];

      // Step 4: Filter results to ensure case-insensitive match
      const filteredResults = combinedResults.filter((accessory) => {
        const batchNumberMatch = accessory.batchNumber?.toLowerCase().includes(lowercaseSearchItem);
        const categoryMatch =
          accessory.categories.itemName?.toLowerCase().includes(lowercaseSearchItem) ||
          accessory.categories.itemModel?.toLowerCase().includes(lowercaseSearchItem) ||
          accessory.categories.brand?.toLowerCase().includes(lowercaseSearchItem);

        return batchNumberMatch || categoryMatch;
      });

      return filteredResults;
    } catch (err) {
      console.error("Error:", err);
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async updateProductById(id, updates) {

    try {
      const updatedProduct = await prisma.accessories.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(),

        },
      });

      return updatedProduct;
    } catch (err) {
      console.log("$%43", err);
      throw new APIError("Database Error", 500);
    }
  }
}

export { InventorymanagementRepository };
