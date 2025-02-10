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
      //console.log("shopFOund", shopFound)
      const assignedSellers = shopFound.assignment
        .filter((assignment) => assignment.status === "assigned")
        .map((seller) => ({
          id: seller.id,
          sellerId: seller.actors.id,
          assignmentId: seller.id,
          name: seller.actors.name,
          phone: seller.actors.phone,
          fromDate: seller.fromDate,
          toDate: seller.toDate,
          status: seller.status
        }));
      console.log(shopFound.assignment)

      const transformAccessory = (item) => ({
        quantity: item.quantity,
        status: item.status,
        productStatus: item.productStatus,
        transferId: item.transferId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        stock: {
          id: item.accessoryID,
          stockStatus: item.accessories.stockStatus,
          commission: item.accessories.commission,
          discount: item.accessories.discount,
          productcost: item.accessories.productCost,
          batchNumber: item.accessories.batchNumber,
        },
        categoryId: {
          id: item.accessories.categories.id,
          itemName: item.accessories.categories.itemName,
          itemModel: item.accessories.categories.itemModel,
          brand: item.accessories.categories.brand,
          minPrice: item.accessories.categories.minPrice,
          maxPrice: item.accessories.categories.maxPrice,
          itemType: item.accessories.categories.itemType,
        },
        quantity: item.quantity,

      });

      const transformPhone = (item) => ({
        quantity: item.quantity,
        status: item.status,
        productStatus: item.productStatus,
        transferId: item.transferId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        stock: {
          id: item.mobileID,
          stockStatus: item.mobiles.stockStatus,
          commission: item.mobiles.commission,
          discount: item.mobiles.discount,
          IMEI: item.mobiles.IMEI,
          productcost: item.mobiles.productCost,
        },
        categoryId: {
          id: item.mobiles.categories.id,
          itemName: item.mobiles.categories.itemName,
          itemModel: item.mobiles.categories.itemModel,
          brand: item.mobiles.categories.brand,
          minPrice: item.mobiles.categories.minPrice,
          maxPrice: item.mobiles.categories.maxPrice,
          itemType: item.mobiles.categories.itemType,

        },
        quantity: item.quantity,
      });

      const newAccessory = shopFound.accessoryItems
        .filter((item) => item.status === "pending" && item.accessoryID !== null)
        .map(transformAccessory);

      const newPhoneItem = shopFound.mobileItems
        .filter((item) => item.status === "pending" && item.mobileID !== null)
        .map(transformPhone);

      const stockItems = shopFound.accessoryItems
        .filter((item) => item.status === "confirmed" && item.quantity > 0)
        .map(transformAccessory);

      const phoneItems = shopFound.mobileItems
        .filter((item) => item.status === "confirmed" && item.quantity !== 0)
        .map(transformPhone);

      const lowStockItems = shopFound.accessoryItems
        .filter((item) => item.quantity < 5 && item.accessoryID !== null)
        .map(transformAccessory);

      const filteredShop = {
        _id: shopFound.id.toString(),
        name: shopFound.shopName,
        address: shopFound.address,
        sellers: assignedSellers,
        newAccessory,
        newPhoneItem,
        stockItems,
        phoneItems,
        lowStockItems,
      };

      return {

        filteredShop: filteredShop,
      };
    } catch (error) {
      throw new APIError(
        "Internal Server Error",
        STATUS_CODE.INTERNAL_ERROR,
        error.message
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
      const sellerId = user.id;
      const type = "assigned"

      const shopId = shop.id;
      console.log(shop.assignment)
      const sellerAssigned = shop.assignment.some(
        (assignment) => assignment.actors.id === sellerId && assignment.status === "assigned"
      );
      if (sellerAssigned) {
        throw new APIError(
          "service error",
          STATUS_CODE.BAD_REQUEST,
          "USER ALREADY ASSIGNED"
        );
      }

      //commit the assignment
      const assignment = await this.user.updateUserAssignment({ sellerId, shopId, fromDate, toDate, type })
      return {
        message: "seller assigned successfully",

      };
    } catch (err) {
      console.log("service error", err)
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

  async removeassignment({ assignmentId }) {
    try {

      const assignment = await this.user.removeUserAssignment(assignmentId)

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
        shopName,
        productName,
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
