// Api/controllers/inventory-management-controller.js
import { ShopmanagementService } from "../../services/shop-services.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

const ShopManagementSystem = new ShopmanagementService();
const getSpecificShop = async (req, res, next) => {
  try {
    const name = req.params.name;
    const getSpecificShop = await ShopManagementSystem.findSpecificShop({
      name,
    });
    return res.status(200).json({ message: "success", shop: getSpecificShop });
  } catch (err) {
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

/**
 * Retrieves all shops.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 *
 * @example
 * GET /shops
 *
 * @returns {Array} The list of all shops.
 */
const getAllShops = async (req, res, next) => {
  try {
    const allShops = await ShopManagementSystem.findAllShop();
    return res.status(200).json({ shops: allShops });
  } catch (err) {
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};



/**
 * Retrieves a specific shop item by name and item name.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 *
 * @example
 * GET /shops/:name/items/:requestedItem?page=1&limit=5
 * {
 *   "name": "John's Shop",
 *   "requestedItem": "Mobile"
 * }
 *
 * @returns {Object} The shop item details.
 */
const findSpecificShopItem = async (req, res, next) => {
  try {
    const name = req.params.name;
    const requestedItem = req.params.requestedItem;
    const { page = 1, limit = 5 } = req.query;

    const result = await ShopManagementSystem.findSpecificShopItem({
      name,
      requestedItem,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    console.log(result);
    return res.status(200).json({ message: result });
  } catch (err) {
    console.log(err);
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

/**
 * Creates a new shop.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 *
 * @example
 * POST /shops
 * {
 *   "name": "New Shop",
 *   "address": "123 Main St"
 * }
 *
 * @returns {Object} The newly created shop details.
 */
const createShop = async (req, res, next) => {
  try {
    const { name, address } = req.body;

    const newShopCreated = await ShopManagementSystem.createshop({
      name,
      address,
    });
    return res.status(201).json({
      status: 201,
      data: newShopCreated,
      isLoggedIn: true,
    });
  } catch (err) {
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const updateShop = async (req, res, next) => {
  try {
    const shopID = req.params.id;
    const shopDetails = req.body;
    const updatedShop = await ShopManagementSystem.updateShop(
      shopID,
      shopDetails
    );
    return res
      .status(200)
      .json({ message: "success", error: false, data: updatedShop });
  } catch (err) {
    if (err instanceof APIError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, error: true });
    } else {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: true });
    }
  }
};
const addassignment = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "manager") {
      return res.status(403).json({ message: "unauthorised", error: true });
    }
    const { name, fromDate, toDate, shopname } = req.body;
    const assign = await ShopManagementSystem.assignSeller({
      name,
      fromDate,
      toDate,
      shopname,
    });
    return res.status(200).json({ message: assign.message, error: false });
  } catch (err) {
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
const removeAssignment = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "manager") {
      res.status(403).json({ message: "unauthorised", error: true });
    }
    const { name, shopname } = req.body;
    const remove = await ShopManagementSystem.removeassignment({
      name,
      shopname,
    });
    return res.status(200).json({ message: remove.message, error: false });
  } catch (err) {
    if (err instanceof APIError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, error: true });
    } else {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: true });
    }
  }
};
const searchproduct = async (req, res) => {
  try {
    const shopName = req.params.shopName;
    const productName = req.query.productName;
    const search = await ShopManagementSystem.findproductbysearch(
      shopName,
      productName
    );

    const { phoneItems, stockItems } = search;
    if (phoneItems.length > 0) {
      return res
        .status(200)
        .json({ message: phoneItems, product: "phone", error: false });
    } else {
      return res
        .status(200)
        .json({ message: stockItems, product: "accessory", error: false });
    }
  } catch (err) {
    if (err instanceof APIError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, error: true });
    } else {
      return res
        .status(500)
        .json({ message: "internal Server Error", error: true });
    }
  }
};
export {
  getSpecificShop,
  getAllShops,
  createShop,
  findSpecificShopItem,
  updateShop,
  addassignment,
  removeAssignment,
  searchproduct,
};
