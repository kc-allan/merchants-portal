// databases/repository/invetory-controller-repository.js
import { Stock } from "../models/stock.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

class InventorymanagementRepository {
  async createnewAccessoryStock({
    CategoryId,
    availableStock,
    commission,
    discount,
    productcost,
    faultyItems,
    user,
    supplierName,
    stockStatus,
    batchNumber
  }) {
    try {
      const newAccessory = new Stock({
        CategoryId,
        batchNumber,
        availableStock,
        discount,
        commission,
        productcost,
        faultyItems,
        supplierName,
        stockStatus,
        history: [
          {
            quantity: availableStock,
            AddedBy: user,
            type: "new",
          },
        ],
      });

      const accessory = newAccessory.save();
      return accessory;
    } catch (err) {
      console.log("service error", err)
      throw new APIError(
        "creating product error",
        STATUS_CODE.INTERNAL_ERROR,
        err || "internal server error"
      );
    }
  }

  //update the sales of the accessory produtct
  async updateSalesAccessoryStock({ id, quantity, shopName, seller }) {
    try {
      const updatedAccessory = await Stock.findByIdAndUpdate(
        id,
        {
          $push: {
            history: {
              seller: seller,
              quantity: quantity,
              shopId: shopName,
              type: "sold",
            },
          },
        },
        { new: true }
      );
      return updatedAccessory;
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
      const updatedAccessory = await Stock.findByIdAndUpdate(
        id,
        {
          $inc: { availableStock: availableStock },
          $push: {
            history: {
              quantity: availableStock,
              type: "new stock update",
            },
          },
        },

        { new: true }
      );
      return updatedAccessory;
    } catch (err) {
      console.log("updateError", err);
      throw new APIError(
        "internal server error",
        STATUS_CODE.INTERNAL_ERROR,
        err || "internal server error"
      );
    }
  }
  async findItem({ itemModel }) {
    try {
      const findItem = await Stock.findOne({ itemModel }).populate({
        path: "CategoryId",
        select: "itemName itemModel brand minPrice maxPrice category",
      }).select({
        availableStock: 1,
        batchNumber: 1,
        supplierName: 1,
        faultyItems: 1,
        commission: 1,
        discount: 1,
        productcost: 1,
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

  async findProductById(id) {
    try {
      const findItem = await Stock.findById(id).populate({
        path: "CategoryId",
        select: "itemName itemModel brand minPrice maxPrice category",
      }).select({
        availableStock: 1,
        batchNumber: 1,
        supplierName: 1,
        faultyItems: 1,
        commission: 1,
        stockStatus: 1,
        discount: 1,
        productcost: 1,
        transferHistory: 1
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
  //find all accessory items to list them

  async findAllStockAcessoryAvailable(page, limit) {
    try {
      const stockAvailable = await Stock.find().populate({
        path: "CategoryId",
        select: "itemName itemModel brand minPrice maxPrice category",
      })
        .select({
          availableStock: 1,
          batchNumber: 1,
          supplierName: 1,
          faultyItems: 1,
          commission: 1,
          discount: 1,
          productcost: 1,
          transferHistory: 1
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ _id: -1 });
      const totalItems = await Stock.countDocuments();
      return { stockAvailable, totalItems };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("databaseERROR", STATUS_CODE.INTERNAL_ERROR);
    }
  }

  //capture a specific item
  async capturespecificproductfordetails({ id }) {
    try {
      const productFound = await Stock.findById(id).populate({
        path: "CategoryId",
        select: "itemName itemModel brand minPrice maxPrice category",
      }).select({
        itemName: 1,
        availableStock: 1,
        batchNumber: 1,
        supplierName: 1,
        faultyItems: 1,
        commission: 1,
        discount: 1,
        productcost: 1,
      });
      console.log("@!#", productFound)
      if (!productFound) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "product not found"
        );
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
  async capturespecificproductfortransferhistory({ id, page, limit }) {
    try {
      const productFound = await Stock.findById(id)
        .populate("transferHistory.fromShop", "name")
        .populate("transferHistory.toShop", "name")
        .select({ transferHistory: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ _id: -1 });
      const totalItems = await Stock.countDocuments();
      if (!productFound) {
        throw new APIError("not found", STATUS_CODE.NOT_FOUND, "not found");
      }
      return {
        productFound,
        totalItems,
      };
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
  async capturespecificproductforhistory({ id, page, limit }) {
    try {
      const productFound = await Stock.findById(id)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ _id: -1 })
        .select({ history: 1 });
      if (!productFound) {
        throw new APIError("not found", STATUS_CODE.NOT_FOUND, "not found");
      }
      const totalItems = await Stock.countDocuments();
      return {
        productFound,
        totalItems,
      };
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

  async updateTransferHistory(id, transferData) {
    try {
      const updatedHistory = await Stock.findByIdAndUpdate(
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

  async saveAccessory(stockItem) {
    await stockItem.save()
  }
  async updateTransferHistory(id, transferData) {
    try {
      const updatedHistory = await Stock.findByIdAndUpdate(
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



  async searchAccessoryProducts(searchItem) {
    try {

      const regexPattern = new RegExp(`^${searchItem}`, "i");
      const results = await Stock.find({})
        .populate({
          path: "CategoryId",
          match: {
            $or: [
              { itemName: { $regex: regexPattern, $options: "i" } },
              { itemModel: { $regex: regexPattern, $options: "i" } },
              { brand: { $regex: regexPattern, $options: "i" } },
            ],
          },
          select: "itemName itemModel brand",
        })
        .select(
          "availableStock productcost commission discount stockStatus batchNumber"
        )
        .lean();
      const filteredResults = results.filter((stock) => stock.CategoryId);

      return filteredResults;
    } catch (err) {
      console.log("Error in search: ", err);
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }


  async updateProductById(id, updates) {
    try {
      const updatedProduct = await Stock.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      return updatedProduct;
    } catch (err) {
      console.log("$%43", err);
      throw new APIError("Database Error", 500);
    }
  }
}

export { InventorymanagementRepository };
