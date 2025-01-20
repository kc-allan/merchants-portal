import { Mobile } from "../models/phoneSchema.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

class phoneinventoryrepository {

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
    serialNumber,
    user,
    financeDetails
  }) {
    try {
      console.log("user", user)

      const stock = new Mobile({
        CategoryId: CategoryId,
        IMEI: IMEI,
        availableStock: availableStock,
        commission: commission,
        productType: productType,
        discount: discount,
        color: color,
        financeDetails,
        serialNumber: serialNumber,
        batchNumber: batchNumber,
        faultyItems: faultyItems,
        supplierName: supplierName,
        productcost: productcost,
        history: {
          addedBy: user,
          quantity: availableStock,
          type: "new stock",
        },
      });
      const newphoneStock = await stock.save();
      return newphoneStock;
    } catch (err) {
      if (err.code === 11000) {
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          "Product IMEI already exists"
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
  //updating sales of a phone stock status
  async updatesalesofaphone({ id, sellerId, status }) {
    try {
      const updatedSalesofthephone = await Mobile.findByIdAndUpdate(
        { _id: id },
        {
          $set: { sellerId: sellerId, status: status },
          $push: {
            history: {
              quantity: 1,
              type: "sold",
            },
          },
        }
      );
      return updatedSalesofthephone;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async updatethephoneStock(id, updates, userName) {
    try {
      const updatedPhone = await Mobile.findByIdAndUpdate(
        id,
        {
          $set: updates,
          $push: {
            history: {
              quantity: 1,
              seller: userName,
              type: "update",
            },
          },
        },
        { new: true, runValidators: true }
      );
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
  async findItem(stockId) {
    try {
      const stockItem = await Mobile.findById(stockId).select('-history -tranferHistory');
      return stockItem;
    } catch (err) {
      console.log("ERERdata", err)
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
  async findPhoneById({ id }) {
    try {
      const findPhone = await Mobile.findById(id).populate({
        path: "CategoryId",
        select: "itemName itemModel"
      }).select('-history -transferHistory');

      // if (!findPhone) {
      //   throw new APIError(
      //     "not found",
      //     STATUS_CODE.NOT_FOUND,
      //     "phone product not found"
      //   );
      // }
      return findPhone;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("internal error", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }

  //update sales
  async updatesalesofaphone({
    id,
    sellerId,
    shopId,
    status,
    quantity,
    seller,
  }) {
    try {
      const updatedSalesofthephone = await Mobile.findByIdAndUpdate(
        id,
        {
          $set: { sellerId: sellerId, stockStatus: status },
          $push: {
            history: {
              seller: seller,
              shopId: shopId,
              quantity: quantity,
              type: "sold",
            },
          },
        },
        { new: true }
      );
      updatedSalesofthephone.save();
      return updatedSalesofthephone;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  //find all accessory items to list them

  async findAllMobileStockAvailable(page, limit) {
    try {
      const stockAvailable = await Mobile.find().populate({
        path: "CategoryId",
        select: "itemName itemModel brand minPrice maxPrice category",
      }).populate({
        path: "sellerId",
        select: "name"
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ _id: -1 })
        .select({
          stockStatus: 1,
          IMEI: 1,
          productcost: 1,
          commission: 1,
          discount: 1,
          stockStatus: 1,
          serialNumber: 1,
          availableStock: 1,
        });
      const totalItems = await Mobile.countDocuments();
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
      const productFound = await Mobile.findById(id).populate({
        path: "CategoryId",
        select: "itemName itemModel brand minPrice maxPrice category",
      }).populate({
        path: "sellerId",
        select: "name",
      }).select({
        stockStatus: 1,
        availableStock: 1,
        productcost: 1,
        IMEI: 1,
        productcost: 1,
        serialNumber: 1,
        discount: 1,
        commission: 1,
      });
      if (!productFound) {
        throw new APIError("not found", STATUS_CODE.NOT_FOUND, "not found");
      }
      return productFound;
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

  async capturespecificproductfortranferhistory({ id }) {
    try {
      const productFound = await Mobile.findById(id)
        .populate("transferHistory.fromShop", "name")
        .populate("transferHistory.toShop", "name")
        .populate("transferHistory.transferdBy", "name")
        .select({ transferHistory: 1 });
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
      const productFound = await Mobile.findById(id)
        .populate("history.shopId", "name")
        .select({ history: 1 });
      if (!productFound) {
        throw new APIError("not found", STATUS_CODE.NOT_FOUND, "not found");
      }
      return productFound;
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

  async saveMobile(stockItem) {
    await stockItem.save();
  }
  async updateTransferHistory(id, transferData) {
    try {
      const updatedHistory = await Mobile.findByIdAndUpdate(
        id,
        { $push: { transferHistory: transferData } },
        { new: true }
      );
      return updatedHistory;
    } catch (err) {
      throw new APIError(
        "database transfer error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async searchMobileProducts(searchItem) {
    try {

      const regexPattern = new RegExp(`^${searchItem}`, "i");


      const imeiQuery = Mobile.find({ IMEI: { $regex: regexPattern } })
        .select(
          "CategoryId availableStock productcost IMEI commission serialNumber discount stockStatus batchNumber"
        )
        .lean();

      const categoryQuery = Mobile.find({})
        .populate({
          path: "CategoryId",
          match: {
            $or: [
              { itemName: { $regex: regexPattern } },
              { itemModel: { $regex: regexPattern } },
              { brand: { $regex: regexPattern } },
            ],
          },
          select: "itemName itemModel brand",
        })
        .select(
          "availableStock productcost IMEI commission discount stockStatus batchNumber"
        )
        .lean();


      const [imeiMatches, categoryMatches] = await Promise.all([imeiQuery, categoryQuery]);


      const populatedImeiMatches = await Mobile.populate(imeiMatches, {
        path: "CategoryId",
        select: "itemName itemModel brand",
      });


      const filteredCategoryMatches = categoryMatches.filter(
        (stock) => stock.CategoryId
      );



      const combinedResults = [...populatedImeiMatches, ...filteredCategoryMatches];

      return combinedResults;
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
