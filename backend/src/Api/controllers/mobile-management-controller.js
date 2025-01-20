// Api/controllers/inventory-management-controller.js
import { MobilemanagementService } from "../../services/mobile-controller-service.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
import moment from "moment";

const inventoryManagementSystem = new MobilemanagementService();
//creating a product mainnly comprising of the items model
//create product is creating the general product since
//products share the same item model etc
const createProduct = async (req, res, next) => {
  try {

    const user = req.user;
    // console.log(user);
    if (user.role !== "superuser" && user.role !== "manager") {
      throw new APIError(
        "not authorised",
        STATUS_CODE.UNAUTHORIZED,
        "not allowed to create a pre"
      )
    }
    const createdProduct = await inventoryManagementSystem.createProduct(req.body)
    res.status(200).json({
      message: "product succuessfully created",
      data: createdProduct
    })
  }
  catch (err) {
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
}
//add newPhone products will add  a product to the database
// this function will push the product id to the product array
// in genaral product item
const addNewPhoneProduct = async (req, res, next) => {
  try {
    const user = req.user;
    console.log(user);
    if (user.role !== "superuser" && user.role !== "manager") {
      throw new APIError(
        "not authorised",
        STATUS_CODE.UNAUTHORIZED,
        "not authorized to add new phone"
      );
    }
    const { phoneDetails, financeDetails } = req.body;
    let availableStock = 1;
    const newPhoneStock = await inventoryManagementSystem.createnewPhoneproduct(
      {
        phoneDetails,
        financeDetails,
        user: user.name,
        availableStock: availableStock,
      }
    );
    res.status(201).json({
      message: "product added",
      data: newPhoneStock,
      error: false,
    });
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

const downloadQRCODE = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "barcodes",
      `${productId}-barcode.pdf`
    );
    res.download(filePath, `${productId}-barcode.pdf`, (err) => {
      if (err) {
        res.status(500).json({ message: "error downloading", error: true });
      }
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: true });
  }
};

const findSpecificMobileProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = req.user;
    if (user.role !== "manager" && user.role !== "superuser") {
      throw new APIError(
        "not allowed",
        403,
        "not allowed to view the product"
      )
    }
    const foundproduct =
      await inventoryManagementSystem.findSpecificMobileProduct(id);
    return res.status(200).json({ status: 200, data: foundproduct });
  } catch (err) {
    console.log("@@", err);
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const findSpecificProductHistory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const productHistory = await inventoryManagementSystem.getproductHistory({
      id,
    });
    return res.status(200).json({ message: productHistory, error: false });
  } catch (err) {
    if (err instanceof APIError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, error: true });
    } else {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: false });
    }
  }
};

const findSpecificProductTransferHistory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const productTransferHistory =
      await inventoryManagementSystem.getproductTransferHistory({ id });
    return res
      .status(200)
      .json({ message: productTransferHistory, error: false });
  } catch (err) {
    if (err instanceof APIError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, error: true });
    } else {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: false });
    }
  }
};

const findAllMobileAccessoryProduct = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const user = req.user;
    if (user.role !== "superuser" && user.role !== "manager") {
      throw new APIError(
        "unauthorized",
        STATUS_CODE.UNAUTHORIZED,
        "not allowed to distribute the product"
      );
    }
    const { filterdItem, totalItems } =
      await inventoryManagementSystem.findAllMobileAccessory(page, limit);
    res.status(200).json({
      message: "all mobile accessories",
      data: filterdItem,
      totalItems,
      page
    });
  } catch (err) {
    console.log(err);
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const createnewproductupdate = async (req, res, next) => {
  try {
    const user = req.user;
    const userName = user.name;
    if (user.role !== "manager" && user.role !== "superuser") {
      throw new APIError(
        "not authorised",
        STATUS_CODE.UNAUTHORIZED,
        "not authorised to commit an update"
      );
    }
    const id = req.params.id;
    const updates = req.body;
    // Call the service method to update the phone stock
    const updatedPhone = await inventoryManagementSystem.updatePhoneStock(
      id,
      updates,
      userName
    );

    return res.status(200).json({
      status: 200,
      // data: updatedPhone,
      message: "Phone stock updated successfully",
    });
  } catch (err) {
    console.log("@@", err);
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};



//the transfer will deal with all mobile transfers from one shop to the other
const createnewMobileTransfer = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw new APIError(
        "unauthorized",
        STATUS_CODE.UNAUTHORIZED,
        "not allowed to transfer the product"
      );
    }
    const userName = user.name;
    const { stockId, mainShop, distributedShop, quantity } = req.body;

    console.log("Request body received in controller:", req.body);

    const newTransfer = await inventoryManagementSystem.createNewMobileTransfer(
      {
        mainShop: mainShop,
        distributedShop: distributedShop,
        userName: userName,
        stockId,
        quantity,
      }
    );

    return res.status(200).json({
      status: 200,
      message: "product successfully transferd",
      error: false
    });
  } catch (err) {
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
const confirmphonearrival = async (req, res, next) => {
  try {
    let userId;
    console.log("ererer", req.body);
    const { shopname, productId, transferId, quantity } = req.body;
    const user = req.user;
    userId = user.id;
    const userName = user.name;
    const updateproductTransfer =
      await inventoryManagementSystem.confirmDistribution({
        userId,
        userName,
        shopname,
        productId,
        quantity,
        transferId,
      });

    return res.status(200).json({
      messsage: "successfully confirmed arrival",
      status: 200,
      error: false,
    });
  } catch (err) {
    console.log(err);
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

const createanewsoftdeleteoftheproduct = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== "superuser" && user.role !== "manager") {
      throw new APIError(
        "unauthorized",
        STATUS_CODE.UNAUTHORIZED,
        "not allowed to update the product"
      );
    }

    const phoneId = req.params.id;

    await inventoryManagementSystem.createAnewSoftDeletion(phoneId);

    return res.status(200).json({
      status: 200,
      data: "successfully deleted the prooduct",
    });
  } catch (err) {
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
export {
  createProduct,
  addNewPhoneProduct,
  createnewproductupdate,
  createnewMobileTransfer,
  confirmphonearrival,
  findAllMobileAccessoryProduct,
  findSpecificMobileProduct,
  createanewsoftdeleteoftheproduct,
  downloadQRCODE,
  findSpecificProductTransferHistory,
  findSpecificProductHistory,
};
