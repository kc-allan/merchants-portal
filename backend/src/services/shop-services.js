import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { usermanagemenRepository } from "../databases/repository/usermanagement-controller-repository.js";
import { InvetorymanagementService } from "./invetory-controller-services.js";
import { MobilemanagementService } from "./mobile-controller-service.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";

class ShopmanagementService {
  constructor() {
    this.repository = new ShopmanagementRepository();
    this.user = new usermanagemenRepository();
    this.inventory = new InvetorymanagementService();
    this.mobile = new MobilemanagementService();
  }
  async createshop(shopdetails) {
    try {
      const { name, address } = shopdetails;

      //check if the shop exist
      const shopExist = await this.repository.findShop({ name });
      if (!shopExist) {
        const newShop = await this.repository.createShop({ name, address });
        return newShop;
      } else {
        throw new APIError(
          "Shop already exist",
          STATUS_CODE.BAD_REQUEST,
          "Shop already exist"
        );
      }
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("Data not found", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }

  async findSpecificShop(shopname) {
    try {
      const { name } = shopname;

      const shopFound = await this.repository.findShop({ name });
      if (!shopFound) {
        throw new APIError(
          "Shop not found",
          STATUS_CODE.NOT_FOUND,
          "No shop found with the given name"
        );
      }
      const unconfirmedAccessories = shopFound.newAccessory.filter(
        (item) => item.status !== "confirmed" || item.productID !== null
      );

      const unconfirmedPhones = shopFound.newPhoneItem.filter(
        (item) => item.status !== "confirmed" || item.productID === null
      );
      const lowStockItems = shopFound.stockItems.filter(
        (item) => item.quantity < 5 && item.stock !== null
      );
      const validStockItems = shopFound.stockItems.filter(
        (item) => item.stock !== null
      );
      const validPhoneItems = shopFound.phoneItems.filter(
        (item) => item.stock !== null
      )

      const filteredShop = {
        ...shopFound._doc,
        newAccessory: unconfirmedAccessories,
        newPhoneItem: unconfirmedPhones,
        stockItems: validStockItems,
        phoneItems: validPhoneItems,
        lowStockItems,
      };
      return {
        filteredShop,
      };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }

      throw new APIError(
        "Shop Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }


  async findAllShop() {
    try {
      const allShops = await this.repository.findShopsAvailable();
      return allShops;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }

      throw new APIError(
        "Shops not found",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async findSpecificShopItem({ name, requestedItem, page, limit }) {
    try {
      const foundResult = await this.repository.findSpecificShopItem({
        name,
        requestedItem,
        page,
        limit,
      });
      const result = foundResult.filter((item) => item.quantity > 0);
      return result;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async updateShop(shopID, shopDetails) {
    try {
      const updatedPhone = await this.repository.updateShopDetails(
        shopID,
        shopDetails
      );

      return updatedPhone;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async confirmArrival(userId, shopname, productId, transferId) {
    try {
      let shopId;
      const findShop = await this.repository.findShop({ name: shopname });
      if (!findShop) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "shop not found"
        );
      }
      shopId = findShop.id;
      //confirm if the seller is assigned so as to confirm arrival
      const sellerAssinged = findShop.sellers.find(
        (seller) => seller._id.toString() === userId.toString()
      );
      if (!sellerAssinged) {
        throw new APIError(
          "Unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "You are not authorized to confirm arrival"
        );
      }

      //check if the product is available awaiting for confirmation

      const productAvailableAwaiting = findShop.newAccessory.find(
        (product) => product.transferId === transferId
      );
      if (!productAvailableAwaiting) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "delivery not found"
        );
      }

      let quantity = productAvailableAwaiting.quantity;

      if (productAvailableAwaiting.status === "confirmed") {
        throw new APIError(
          "bad request",
          STATUS_CODE.BAD_REQUEST,
          "product already confirmed"
        );
      }

      const inventoryConfirm = await this.inventory.confirmDistribution({
        shopId,
        userId,
        productId,
        quantity,
        transferId,
      });
      return inventoryConfirm;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }
  // async confirmphoneArrival(userId, shopname, productId, transferId) {
  //     try {
  //         let shopId;
  //         const findShop = await this.repository.findShop({ name: shopname });
  //         if (!findShop) {
  //             throw new APIError("not found", STATUS_CODE.NOT_FOUND, "shop not found")
  //         }
  //         shopId = findShop.id;

  //         //confirm if the seller is assigned so as to confirm arrival
  //         const sellerAssinged = findShop.sellers.find(seller => seller._id.toString() === userId.toString())
  //         if (!sellerAssinged) {
  //             throw new APIError("Unauthorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to confirm arrival")
  //         }
  //         //check if the product is available awaiting for confirmation
  //         const productAvailableAwaiting = findShop.newPhoneItem.find((product) => product.productID._id.toString() === productId);
  //         if (!productAvailableAwaiting) {
  //             throw new APIError("not found", STATUS_CODE.NOT_FOUND, "product not found")
  //         }

  //         let quantity = productAvailableAwaiting.quantity

  //         if (productAvailableAwaiting.status === "confirmed") {
  //             throw new APIError("bad request", STATUS_CODE.BAD_REQUEST, "product already confirmed")
  //         }

  //         const inventoryConfirm = await this.mobile.confirmDistribution({ shopId, userId, productId, quantity, transferId })
  //         return inventoryConfirm
  //     }
  //     catch (err) {
  //         if (err instanceof APIError) {
  //             throw err;
  //         }
  //         throw new APIError("Service Error", STATUS_CODE.INTERNAL_ERROR, "Internal server error");
  //     }
  // }

  async assignSeller({ name, fromDate, toDate, shopname }) {
    try {
      const shop = await this.repository.findShop({ name: shopname });
      if (!shop) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "shop not found"
        );
      }
      const user = await this.user.findUserByname({ name: name });
      const userID = user.id;
      console.log("userid", userID);
      const shopID = shop.id;
      const sellerAssigned = shop.sellers.find(
        (seller) => seller._id.toString() === userID.toString()
      );
      if (sellerAssigned) {
        throw new APIError(
          "service error",
          STATUS_CODE.BAD_REQUEST,
          "USER ALREADY ASSIGNED"
        );
      }
      shop.sellers.push(userID);
      shop.save();
      const updateUserAssignmentHistory = await this.user.updateUserAssignment({
        sellerId: userID,
        shopId: shopID,
        fromDate: fromDate,
        toDate: toDate,
        type: "assigned",
      });
      return {
        message: "seller assigned successfully",
      };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  //remove seller from the shop

  async removeassignment({ name, shopname }) {
    try {
      const shop = await this.repository.findShop({ name: shopname });
      if (!shop) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "shop not found"
        );
      }
      const shopId = shop.id;
      const user = await this.user.findUserByname({ name: name });
      const userId = user.id;
      // Remove the seller from the shop's seller list
      shop.sellers = shop.sellers.filter(
        (seller) => seller._id.toString() !== userId
      );
      await shop.save();

      // Update the user's assignment history with the toDate
      const toDate = new Date(); // Assuming you want to set the current date as the toDate
      const updatedUser = await this.user.updateUserAssignment({
        sellerId: userId,
        shopId: shopId,
        fromDate: user.assignedShop ? user.assignedShop.fromDate : null, // Assuming fromDate is stored when the user is assigned
        toDate: toDate,
        type: "removed",
      });

      // Remove the shop from the user's assigned shops
      updatedUser.assignedShop = null;
      await updatedUser.save();

      return { message: "success" };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }
  async findproductbysearch(productName, shopName) {
    try {
      const products = await this.repository.searchProductName(
        productName,
        shopName
      );
      if (!products.phoneItems.length && !products.stockItems.length && !products.matchingImei.length) {
        throw new APIError(
          "No products found",
          STATUS_CODE.NOT_FOUND,
          "product not found"
        );
      }
      return products;
    } catch (err) {
      console.log("err", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }
}

export { ShopmanagementService };
