// databases/repository/invetory-controller-repository.js
import { Shop } from "../models/shopSchema.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
import mongoose from "mongoose";

class ShopmanagementRepository {
  async createShop({ name, address }) {
    try {
      const shop = new Shop({ name, address });
      const newShop = await shop.save();
      return newShop;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        "unable to Create Shop"
      );
    }
  }
  async findShopById(id) {
    try {
      const shopFound = await Shop.findById(id);
      if (!shopFound) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "Shop not found"
        );
      }
      return shopFound;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to find Shop"
      );
    }
  }
  async findShop({ name }) {
    try {
      const findShop = await Shop.findOne({ name })
        .select({
          name: 1,
          address: 1,
          sellers: 1,
          newAccessory: 1,
          newPhoneItem: 1,
          stockItems: 1,
          phoneItems: 1,
        })
        .populate({
          path: "stockItems.categoryId",
          model: "products",
          select: "itemName brand itemModel minPrice maxPrice itemType"
        })
        .populate({
          path: "stockItems.stock",
          model: "accessories",
          select: "productcost commission productcost discount stockStatus",
        })
        .populate({
          path: "phoneItems.categoryId",
          model: "products",
          select: "itemName brand itemModel minPrice maxPrice itemType"
        })
        .populate({
          path: "phoneItems.stock",
          model: "mobiles",
          select: "productcost IMEI commission productcost discount stockStatus",
        })
        .populate({
          path: "newAccessory.categoryId",
          model: "products",
          select: "itemName brand itemModel minPrice maxPrice "
        })
        .populate({
          path: "newAccessory.productID",
          model: "accessories",
          select: "productcost commission discount",
        })
        .populate({
          path: "newPhoneItem.categoryId",
          model: "products",
          select: "itemName brand itemModel minPrice maxPrice "
        })
        .populate({
          path: "newPhoneItem.productID",
          model: "mobiles",
          select: "productcost commission discount IMEI",
        })
        .populate({
          path: "sellers",
          model: "actors",
          select: "name phone assignmentHistory",
        });
      return findShop;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to find the shop"
      );
    }
  }
  async findShopsAvailable() {
    try {
      const findShop = await Shop.find().select({ name: 1, address: 1 });
      return findShop;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to find the shop"
      );
    }
  }

  async findSpecificShopItem({ name, requestedItem, page = 1, limit = 10 }) {
    try {
      const shop = await Shop.findOne({ name })
        .select({ name: 1, sellers: 1, stockItems: 1, phoneItems: 1 })
        .populate({
          path: "stockItems.stock",
          model: "Accessories",
          select: "itemName brand itemModel minprice maxprice",
        })
        .populate({
          path: "phoneItems.stock",
          model: "Mobile",
          select: "itemName brand itemModel minprice maxprice",
        });

      if (!shop) {
        throw new APIError(
          "Shop not found",
          STATUS_CODE.NOT_FOUND,
          "Shop not found"
        );
      }

      let items = [];
      if (requestedItem === "phoneItems") {
        items = shop.phoneItems.filter((item) => item.stock !== null);
      } else if (requestedItem === "stockItems") {
        items = shop.stockItems.filter((item) => item.stock !== null);
      } else {
        throw new APIError(
          "Invalid requested item type",
          STATUS_CODE.BAD_REQUEST,
          "Invalid item type"
        );
      }

      // Pagination logic
      const startIndex = (page - 1) * limit;
      const paginatedItems = items.slice(startIndex, startIndex + limit);

      return {
        totalItems: items.length,
        totalPages: Math.ceil(items.length / limit),
        currentPage: page,
        items: paginatedItems,
      };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to find the shop"
      );
    }
  }

  async updateShopDetails(shopID, shopDetails) {
    try {
      //FINDTHESHOP
      const shop = await Shop.findById(shopID);
      if (!shop) {
        throw new APIError(
          "Shop not found",
          STATUS_CODE.NOT_FOUND,
          "Shop not found"
        );
      }
      const updatedShop = await Shop.findByIdAndUpdate(shopID, shopDetails, {
        new: true,
      });
      return updatedShop;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to update Shop"
      );
    }
  }

  async updateSalesOfAccessory(shopId, productId, soldUnits) {
    console.log("@@#soldunits", soldUnits)
    try {
      const updateSalesOfAccessory = await Shop.findOneAndUpdate(
        { _id: shopId, "stockItems.stock": productId },
        {
          $inc: { "stockItems.$.quantity": -soldUnits },
        },
        { new: true }
      )
      return updateSalesOfAccessory
    }
    catch (err) {
      console.log(err)
      throw new APIError("update error", STATUS_CODE.INTERNAL_ERROR, "server error")
    }
  }

  async updateSalesOfPhone(shopId, productID, soldUnits) {
    try {
      const updateSalesOfPhone = await Shop.findOneAndUpdate(
        { _id: shopId, "phoneItems.stock": productID },
        {
          $inc: { "phoneItems.$.quantity": -soldUnits },
        },
        { new: true }
      )
      return updateSalesOfPhone
    }
    catch (err) {
      console.log(err)
      throw new APIError("update error", STATUS_CODE.INTERNAL_ERROR, "server error")
    }
  }
  async searchProductName(productName, shopName) {
    console.log("#@#", shopName)

    try {
      const regexPattern = new RegExp(`^${productName}`, "i");

      // Find the shop by name
      const shop = await Shop.findOne({ name: shopName }).lean();
      if (!shop) {
        throw new Error(`Shop with name ${shopName} not found`);
      }
      // Search for products in phoneItems and populate CategoryId
      const phoneItems = await Shop.aggregate([
        { $match: { name: { $regex: `^${shopName}$`, $options: "i" } } },
        { $unwind: "$phoneItems" },
        {
          $lookup: {
            from: "products",
            localField: "phoneItems.categoryId",
            foreignField: "_id",
            as: "phoneItems.categoryDetails",
          },
        },
        { $unwind: { path: "$phoneItems.categoryDetails", preserveNullAndEmptyArrays: true } }, // Unwind categoryDetails
        {
          $match: {
            $or: [
              { "phoneItems.categoryDetails.itemName": { $regex: regexPattern } },
              { "phoneItems.categoryDetails.itemModel": { $regex: regexPattern } },
              { "phoneItems.categoryDetails.brand": { $regex: regexPattern } },
            ],
          },
        },
        {
          $lookup: {
            from: "mobiles",
            localField: "phoneItems.stock",
            foreignField: "_id",
            as: "phoneItems.stockDetails",
          }
        },
        { $unwind: { path: "$phoneItems.stockDetails", preserveNullAndEmptyArrays: true } },

        {
          $project: {
            "phoneItems.stock": 1,
            "phoneItems.quantity": 1,
            "phoneItems.categoryDetails.itemName": 1,
            "phoneItems.categoryDetails.itemModel": 1,
            "phoneItems.categoryDetails.brand": 1,
            "phoneItems.categoryDetails.maxPrice": 1,
            "phoneItems.categoryDetails.minPrice": 1,
            "phoneItems.stockDetails.IMEI": 1,
            "phoneItems.stockDetails.serialNumber": 1,
            "phoneItems.stockDetails.color": 1,
            "phoneItems.stockDetails.stockStatus": 1,
            "phoneItems.stockDetails.commission": 1
          },
        },
      ]);

      console.log("Phone Items:", JSON.stringify(phoneItems, null, 2));
      const matchingImei = await Shop.aggregate([
        { $match: { name: { $regex: `^${shopName}$`, $options: "i" } } },
        { $unwind: "$phoneItems" },
        {
          $lookup: {
            from: "mobiles",
            localField: "phoneItems.stock",
            foreignField: "_id",
            as: "phoneItems.stockDetails"
          },
        },
        { $unwind: { path: "$phoneItems.stock", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { "phoneItems.stockDetails.IMEI": { $regex: regexPattern } },
              { "phoneItems.stockDetails.serialNumber": { $regex: regexPattern } }
            ]
          }
        },
        {
          $lookup: {
            from: "products",
            localField: "phoneItems.categoryId",
            foreignField: "_id",
            as: "phoneItems.categoryDetails"
          }
        },
        { $unwind: { path: "$phoneItems.categoryDetails", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "phoneItems.quantity": 1,
            "phoneItems.categoryDetails.itemName": 1,
            "phoneItems.categoryDetails.itemModel": 1,
            "phoneItems.categoryDetails.brand": 1,
            "phoneItems.categoryDetails.maxPrice": 1,
            "phoneItems.categoryDetails.minPrice": 1,
            "phoneItems.stockDetails.IMEI": 1,
            "phoneItems.stockDetails.serialNumber": 1,
            "phoneItems.stockDetails.color": 1,
            "phoneItems.stockDetails.stockStatus": 1,
            "phoneItems.stockDetails.commission": 1
          }
        }
      ])
      const stockItems = await Shop.aggregate([
        { $match: { name: shopName } },
        { $unwind: "$stockItems" },
        {
          $lookup: {
            from: "products",
            localField: "stockItems.categoryId",
            foreignField: "_id",
            as: "stockItems.categoryDetails",
          },
        },
        { $unwind: "$stockItems.categoryDetails" },
        {
          $match: {
            $or: [
              { "stockItems.categoryDetails.itemName": { $regex: regexPattern } },
              { "stockItems.categoryDetails.itemModel": { $regex: regexPattern } },
              { "stockItems.categoryDetails.brand": { $regex: regexPattern } },
            ],
          },
        },
        {
          $lookup: {
            from: "accessories",
            localField: "stockItems.stock",
            foreignField: "_id",
            as: "stockItems.stockDetails",
          }
        },
        { $unwind: { path: "$stockItems.stockDetails", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "stockItems.stock": 1,
            "stockItems.quantity": 1,
            "stockItems.categoryDetails.itemName": 1,
            "stockItems.categoryDetails.itemModel": 1,
            "stockItems.categoryDetails.brand": 1,
            "stockItems.stockDetails.batchNumber": 1,
            "stockItems.stockDetails.serialNumber": 1,
            "stockItems.stockDetails.stockStatus": 1,
            "stockItems.stockDetails.commission": 1
          },
        },
      ])
      return {
        phoneItems,
        stockItems,
        matchingImei
      };
    } catch (err) {
      console.error("Error in searchProductName:", err);
      throw err;
    }
  }
  async newAddedphoneItem(id, newItem) {
    try {
      const updatedShop = await Shop.findByIdAndUpdate(
        id,
        { $push: { newPhoneItem: newItem } },
        { new: true }
      );
      return updatedShop;
    } catch (err) {
      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "database error"
      );
    }
  }
  async addNewAccessory(id, newItem) {
    try {
      const updatedShop = await Shop.findByIdAndUpdate(
        id,
        { $push: { newAccessory: newItem } },
        { new: true }
      );
      return updatedShop;
    } catch (err) {
      console.log("343", err)
      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "database error"
      );
    }
  }
  async addPhoneStock(id, newItem) {
    try {
      const updatedShop = await Shop.findByIdAndUpdate(
        id,
        { $push: { phoneItems: newItem } },
        { new: true }
      );
      return updatedShop;
    } catch (err) {
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async addAcessoryStock(id, newItem) {
    try {
      const updatedShop = await Shop.findByIdAndUpdate(
        id,
        { $push: { stockItems: newItem } },
        { new: true }
      );
      return updatedShop;
    } catch (err) {
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async updateAccessoryQuantity(shopId, accessoryId, quantity) {
    try {
      const updatedNewAccessoryItem = await Shop.findOneAndUpdate(
        { _id: shopId, "stockItems.stock": accessoryId },
        {
          $inc: { "stockItems.$.quantity": quantity },
        },
        { new: true }
      );
      return updatedNewAccessoryItem;
    } catch (err) {
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async updateConfirmationOfProduct(shopId, newPhoneItemId, userName) {
    try {
      const updatedNewPhoneItem = await Shop.findOneAndUpdate(
        { _id: shopId, "newPhoneItem._id": newPhoneItemId },
        {
          $set: {
            "newPhoneItem.$.status": "confirmed",
            "newPhoneItem.$.confirmedBy": userName,
          },
        },
        { new: true }
      );
      return updatedNewPhoneItem;
    } catch (err) {
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async updateConfirmationOfAccessory(shopId, newAccessoryItemId, userName) {
    try {
      const updatedNewAccessoryItem = await Shop.findOneAndUpdate(
        { _id: shopId, "newAccessory._id": newAccessoryItemId },
        {
          $set: {
            "newAccessory.$.status": "confirmed",
            "newAccessory.$.confirmedBy": userName,
          },
        },
        { new: true }
      );
      return updatedNewAccessoryItem;
    } catch (err) {
      console.log("err", err)
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async saveShop(shop) {
    await shop.save();
  }
}

export { ShopmanagementRepository };
