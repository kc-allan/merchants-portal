import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
class phoneinventoryrepository {
  async createPhonewithFinaceDetails(payload) {
    try {
      const { phoneDetails, financeDetails, shopId, user } = payload;

      const newMobileProduct = await this.createphoneStock({ ...phoneDetails });
      await this.createFinanceDetails(newMobileProduct.id, financeDetails);
      await this.createHistory({
        user,
        shopId,
        productId: newMobileProduct.id,
        type: "new stock",
      });
    } catch (err) {
      console.log("err", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "server error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async createphoneStock({
    CategoryId,
    IMEI,
    productcost,
    color,
    commission,
    discount,
    availableStock,
    faultyItems,
    supplierName,
    batchNumber,
    productType,
    storage,
  }) {
    try {
      const category = parseInt(CategoryId, 10);

      const stock = await prisma.mobiles.create({
        data: {
          CategoryId: category,
          IMEI: IMEI,
          availableStock: availableStock,
          commission: commission,
          phoneType: productType,
          discount: discount,
          storage: storage,
          color: color,
          batchNumber: batchNumber,
          supplierName: supplierName,
          productCost: productcost,
          createdAt: new Date(),
        },
      });

      return stock;
    } catch (err) {
      console.log("err", err);
      if (err.code === "P2002") {
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          `A product with the same ${err.meta.target} already exists.`
        );
      } else {
        throw new APIError(
          "API Error",
          STATUS_CODE.INTERNAL_ERROR,
          err.message || "Unable to create new goods"
        );
      }
    }
  }

  async createFinanceDetails(productId, financeDetails) {
    try {
      const updatedFinaceDetails = await prisma.mobilefinance.create({
        data: {
          financer: financeDetails.financer,
          financeAmount: financeDetails.financeAmount,
          financeStatus: financeDetails.financeStatus,
          productID: productId,
        },
      });
      return updatedFinaceDetails;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to create new goods"
      );
    }
  }

  async createHistory({ productId, user, type, shopId }) {
    try {
      const createHistory = await prisma.mobileHistory.create({
        data: {
          productID: productId,
          type: type,
          shopId: shopId,
          addedBy: user,
        },
      });
      return createHistory;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  //updating sales of a phone stock status
  async updatesalesofaphone({ id, sellerId, status }) {
    try {
      const updatedSalesofthephone = await prisma.mobileHistory.updateMany({
        where: {
          productID: id,
        },
        data: {
          sellerId: sellerId,
          type: status,
          updatedAt: new Date(),
        },
      });
      return updatedSalesofthephone;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async updateSoldPhone(id) {
    try {
      const updateSoldPhone = await prisma.mobiles.update({
        where: {
          id: id,
        },
        data: {
          stockStatus: "sold",
          updatedAt: new Date(),
        },
      });
      return updateSoldPhone;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async updateConfirmedmobileItem(confirmedData) {
    try {
      const { status, userId, transferId, shopId } = confirmedData;
      const updatedTransfer = await prisma.mobileItems.updateMany({
        where: {
          shopID: shopId,
          transferId: transferId,
        },
        data: {
          confirmedBy: userId,
          status: status,
          updatedAt: new Date(),
        },
      });
      return updatedTransfer;
    } catch (err) {
      console.log("error in update", err);
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error "
      );
    }
  }
  async updatetransferHistory(distributionData) {
    try {
      const { status, userId, id } = distributionData;
      const updatedTransferHistory = await prisma.mobiletransferHistory.update({
        where: {
          id: id,
        },
        data: {
          actors_mobiletransferHistory_confirmedByToactors: {
            connect: { id: userId },
          },
          status: status,
          updatedAt: new Date(),
        },
      });
      return updatedTransferHistory;
    } catch (err) {
      console.log("error on update", err);
      throw new APIError(
        "internal server error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error "
      );
    }
  }
  async updateMobileDistributionStatusQuantity(id, distributionData) {
    try {
      const { status, quantity } = distributionData;
      const updatedPhone = await prisma.mobiles.update({
        where: {
          id: id,
        },
        data: {
          availableStock: {
            decrement: quantity,
          },
          stockStatus: status,
          updatedAt: new Date(),
        },
      });
      return updatedPhone;
    } catch (err) {
      console.log("er", err);
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async updatethephoneStock(mobileId, updates, user, shopId) {
    try {
      const updatedPhone = await prisma.mobiles.update({
        where: {
          id: mobileId,
        },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      });
      await this.createHistory({
        user,
        shopId,
        productId: mobileId,
        type: "update",
      });
      return updatedPhone;
    } catch (err) {
      if (err.code === 11000) {
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          "product already exists"
        );
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to update the phone"
      );
    }
  }
  async findMobileTransferHistory(id) {
    try {
      const mobileItems = await prisma.mobiletransferHistory.findUnique({
        where: {
          id: id,
        },
      });
      return mobileItems;
    } catch (err) {
      throw new APIError(
        "internal server error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async findItem(stockId) {
    try {
      const stockItem = await prisma.mobiles.findUnique({
        where: {
          id: stockId,
        },
        select: {
          id: true,
          stockStatus: true,
          availableStock: true,
          CategoryId: true,
          productCost: true,
          commission: true,
        },
      });
      // const stockItem = await Mobile.findById(stockId).select('-history -tranferHistory');
      return stockItem;
    } catch (err) {
      console.log("ERERdata", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async findMobileFinance(productId) {
    try {
      const finance = await prisma.mobilefinance.findFirst({
        where: {
          productID: productId,
        },
      });
      return finance;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  //update sales
  // async updatesalesofaphone({
  //   id,
  //   sellerId,
  //   shopId,
  //   status,
  //   quantity,
  //   seller,
  // }) {
  //   try {
  //     const updatedSalesofthephone = await Mobile.findByIdAndUpdate(
  //       id,
  //       {
  //         $set: { sellerId: sellerId, stockStatus: status },
  //         $push: {
  //           history: {
  //             seller: seller,
  //             shopId: shopId,
  //             quantity: quantity,
  //             type: "sold",
  //           },
  //         },
  //       },
  //       { new: true }
  //     );
  //     updatedSalesofthephone.save();
  //     return updatedSalesofthephone;
  //   } catch (err) {
  //     throw new APIError(
  //       "Database Error",
  //       STATUS_CODE.INTERNAL_ERROR,
  //       "internal server error"
  //     );
  //   }
  // }
  //find all accessory items to list them

  async findAllMobileStockAvailable(page, limit) {
    try {
      // Fetch paginated and sorted mobile stock
      const stockAvailable = await prisma.mobiles.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
          stockStatus: true,
          IMEI: true,
          productCost: true,
          color: true,
          commission: true,
          discount: true,
          batchNumber: true,
          supplierName: true,
          CategoryId: true,
          storage: true,
          itemType: true,
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
          mobilefinance: {
            select: {
              financeAmount: true,
              financeStatus: true,
              financer: true,
            },
          },
        },
      });

      // Get the total count of available stock
      const totalItems = await prisma.mobiles.count({
        where: {
          stockStatus: "available",
        },
      });

      return { stockAvailable, totalItems };
    } catch (err) {
      console.log(err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("databaseERROR", STATUS_CODE.INTERNAL_ERROR);
    }
  }
  //capture a specific item
  async capturespecificproductfordetails(id) {
    try {
      const productFound = await prisma.mobiles.findUnique({
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
          mobilefinance: true,
        },
      });
      console.log(productFound);
      return productFound;
    } catch (err) {
      console.log("error", err);
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

  async capturespecificproductfortranferhistory({ id }) {
    try {
      const productId = parseInt(id, 10);
      const productFound = await prisma.mobiletransferHistory.findMany({
        where: {
          productID: productId,
        },
        select: {
          shops_mobiletransferHistory_fromshopToshops: {
            select: {
              shopName: true,
            },
          },
          shops_mobiletransferHistory_toshopToshops: {
            select: {
              shopName: true,
            },
          },
          actors_mobiletransferHistory_confirmedByToactors: {
            select: {
              name: true,
            },
          },
          actors_mobiletransferHistory_transferdByToactors: {
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
      console.log(err);
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
  async capturespecificproductforhistory({ id }) {
    try {
      const productId = parseInt(id, 10);
      const productHistory = await prisma.mobileHistory.findMany({
        where: {
          productID: productId,
        },
        include: {
          actors: {
            select: {
              name: true,
              email: true,
            },
          },
          shops: {
            select: {
              shopName: true,
              address: true,
            },
          },
        },
      });
      return productHistory;
    } catch (err) {
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
  async updateMobileItemsTransfer(id, quantity) {
    try {
      const updatEdTransfer = await prisma.mobileItems.update({
        where: {
          id: id,
        },
        //decrement the quantity of the item
        data: {
          quantity: {
            decrement: quantity,
          },
          status: "transferd",
        },
      });
    } catch (err) {
      console.log("err", err);
      throw new APIError(
        "database transfer error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async createTransferHistory(id, transferData) {
    try {
      const createdTransferHistory = await prisma.mobiletransferHistory.create({
        data: {
          quantity: transferData.quantity,
          status: transferData.status,
          type: transferData.type,
          shops_mobiletransferHistory_fromshopToshops: {
            connect: { id: transferData.toShop },
          },
          shops_mobiletransferHistory_toshopToshops: {
            connect: { id: transferData.fromShop },
          },
          actors_mobiletransferHistory_transferdByToactors: {
            connect: { id: transferData.transferdBy },
          },
          mobiles: {
            connect: { id: id },
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

  async searchMobileProducts(searchItem) {
    try {
      const lowercaseSearchItem = searchItem.toLowerCase(); // Convert search term to lowercase


      const imeiMatches = await prisma.mobiles.findMany({
        where: {
          IMEI: {
            contains: lowercaseSearchItem,
          },
        },
        select: {
          id: true,
          IMEI: true,
          availableStock: true,
          productCost: true,
          commission: true,
          discount: true,
          stockStatus: true,
          batchNumber: true,
          categories: {
            select: {
              itemName: true,
              itemModel: true,
              brand: true,
            },
          },
        },
      });

      const categoryMatches = await prisma.mobiles.findMany({
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
          IMEI: true,
          availableStock: true,
          productCost: true,
          commission: true,
          discount: true,
          stockStatus: true,
          batchNumber: true,
          categories: {
            select: {
              itemName: true,
              itemModel: true,
              brand: true,
            },
          },
        },
      });


      const combinedResults = [...imeiMatches, ...categoryMatches];


      const filteredResults = combinedResults.filter((mobile) => {
        const imeiMatch = mobile.IMEI?.toLowerCase().includes(lowercaseSearchItem);
        const categoryMatch =
          mobile.categories.itemName?.toLowerCase().includes(lowercaseSearchItem) ||
          mobile.categories.itemModel?.toLowerCase().includes(lowercaseSearchItem) ||
          mobile.categories.brand?.toLowerCase().includes(lowercaseSearchItem);

        return imeiMatch || categoryMatch;
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

  async softcopyofphoneItem({ id }) {
    try {
      const deletedPhone = await Mobile.findByIdAndUpdate(
        id,
        {
          $set: { stockStatus: "deleted" },
          $push: {
            history: {
              quantity: 1,
              type: "Deleted",
            },
          },
        },
        { new: true }
      );

      if (!deletedPhone) {
        throw new APIError(
          "Product not found",
          STATUS_CODE.NOT_FOUND,
          "product not found"
        );
      }
      return deletedPhone;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }

      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
}

export { phoneinventoryrepository };
