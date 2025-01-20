// Api/controllers/inventory-management-controller.js
import path from "path";
import moment from "moment";
import { fileURLToPath } from "url";
import { InvetorymanagementService } from "../../services/invetory-controller-services.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inventoryManagementSystem = new InvetorymanagementService();

const createnewstock = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "manager" && user.role !== "superuser") {
      throw new APIError(
        "unauthorized",
        STATUS_CODE.UNAUTHORIZED,
        "You are not authorized to perform this action"
      )
    }
    const itemData = {
      ...req.body,
      user: user.name
    }
    const newStock = await inventoryManagementSystem.createnewproduct(itemData);
    return res.status(201).json({
      status: 201,
      message: "product successfully created",
      error: false,
    });
  } catch (err) {
    console.log("@@EWE", err)
    if (err instanceof APIError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, error: true });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const getProductProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const productId = req.params.id;
    const period = req.query.period;
    let startdate;
    let endDate;
    if (user.role !== "manager" && user.role !== "superuser") {
      throw new APIError(
        "UNAUTHORIZED",
        STATUS_CODE.UNAUTHORIZED,
        "denied to view product profile"
      );
    }
    const getStartdate = (date) => {
      let start = new Date(date);
      start.setHours(0, 0, 0, 0);
      return start;
    };

    const getendDate = (date) => {
      let end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return end;
    };

    if (req.query.date) {
      startdate = date ? getStartdate(date) : getStartdate(new Date());
      endDate = date ? getendDate(date) : getendDate(new Date());
    } else {
      const now = moment();
      switch (period) {
        case "week":
          startdate = now.startOf("week").toDate();
          endDate = now.endOf("week").toDate();
          break;
        case "month":
          startdate = now.startOf("month").toDate();

          endDate = now.endOf("month").toDate();
          break;
        case "year":
          startdate = now.startOf("year").toDate();
          endDate = now.endOf("year").toDate();
          break;
        default:
          startdate = now.startOf("day").toDate();
          endDate = now.endOf("day").toDate();
      }
    }

    const productprofile = await inventoryManagementSystem.getProductProfile(
      productId,
      startdate,
      endDate
    );

    return res.status(200).json({
      status: 200,
      message: productprofile,
    });
  } catch (err) {
    console.log("@@!32", err)
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({
        message: err.message,
        statusCode: err.statusCode,
        error: true,
      });
    }
    console.log(err);
    return res.status(500).json({ message: "internal server error" });
  }
};
const findSpecificProductHistory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const productHistory = await inventoryManagementSystem.getproductHistory({
      id,
      page,
      limit,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const productTransferHistory =
      await inventoryManagementSystem.getproductTransferHistory({
        id,
        page,
        limit,
      });
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
//download the pdf file

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
        res.status(500).send("Error downloading file");
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

//first phase to deal with the accessory administartion
const findAllAccessoryProduct = async (req, res, next) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const { filterdItem, totalItems } =
      await inventoryManagementSystem.findAllAccessory(page, limit);
    return res.status(200).json({
      item: filterdItem,
      currentPage: page,
      limit: limit,
      user,
      isLoggedIn: true,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (err) {
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};



const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedStock = await inventoryManagementSystem.updateProduct(
      id,
      updates
    );

    if (!updatedStock) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
        error: true,
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Product successfully updated",
      data: updatedStock,
      error: false,
    });
  } catch (err) {
    console.log("@@@@22", err);
    if (err instanceof APIError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, error: true });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const confirmarrival = async (req, res, next) => {
  try {
    let userId;
    let userName
    const user = req.user;
    userId = user.id;
    userName = user.name
    const confirmDetails = {
      ...req.body,
      userId,
      userName
    }
    const updateproductTransfer = await inventoryManagementSystem.confirmDistribution(confirmDetails);
    return res
      .status(200)
      .json({ messsage: "successfully confirmed arrival", error: false });
  } catch (err) {
    console.log("@@#", err)
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

//the transfer will deal with all accessory transfers
const createnewTransfer = async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;
    const userName = user.name
    const transferDetails = {
      ...req.body,
      userName,
      userId
    }
    const newTransfer = await inventoryManagementSystem.createnewTransfer(transferDetails);

    return res.status(200).json({
      status: 200,
      message: "transfer successfully created",
    });
  } catch (err) {
    console.log("@@@", err);
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

export {
  createnewstock,
  createnewTransfer,
  getProductProfile,
  findAllAccessoryProduct,
  updateStock,
  downloadQRCODE,
  confirmarrival,
  findSpecificProductHistory,
  findSpecificProductTransferHistory,
};
