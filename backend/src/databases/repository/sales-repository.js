import { salesDatabase } from "../models/sales.js";
import categoryrevenue from "../models/categoryrevenue.js";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

class Sales {
  /**
   * Creates a new sales record in the database.
   *
   * @param {Object} salesDetails - The details of the new sales record.
   * @returns {Promise<Object>} - A promise that resolves to the newly created sales record if successful, or rejects with an APIError if an error occurs.
   * @throws {APIError} - Throws an APIError with the appropriate status code and message if the sales record cannot be created or if there is an internal server error.
   */
  async createnewsales({ salesDetails }) {
    try {
      const { soldprice, category } = salesDetails;
      const newsales = new salesDatabase(salesDetails);
      if (!newsales) {
        throw new APIError(
          "database error",
          STATUS_CODE.BAD_REQUEST,
          "failed to add sales"
        );
      }

      const categoryRevenue = await categoryrevenue.findOne({
        category,
        soldprice,
      });
      if (categoryRevenue) {
        categoryRevenue.totalRevenue += amount;
        await categoryRevenue.save();
      } else {
        await categoryrevenue.create({
          category,
          totalRevenue: soldprice,
          totalCommission: 0,
        });
      }
      const successfullsale = newsales.save();

      return successfullsale;
    } catch (err) {
      console.log("err", err);
      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async findSalesById(salesId) {
    try {
      const sales = await salesDatabase.findById(salesId).populate({
        path: "CategoryId",
        select: "itemModel itemName,brand"
      });

      if (!sales) {
        throw new APIError(
          "database error".STATUS_CODE.NOT_FOUND,
          "sales not found"
        );
      }
      console.log("@@", sales)
      return sales;
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

  async findSales({ database, startdate, endDate }) {
    try {
      console.log("database", database)
      const generalReport = await salesDatabase.aggregate([
        {
          $addFields: {
            netamountsoldforthegood: {
              $subtract: ["$soldprice", "$commission"],
            },
          },
        },
        {
          $match: {
            createdAt: { $gte: startdate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              productId: "$productId",
              CategoryId: "$CategoryId",
              sellerId: "$sellerId",
              shopId: "$shopId",
              soldunits: "$soldunits",
              createdAt: "$createdAt"
            },
            soldprice: { $sum: "$soldprice" },
            netamountsoldforthegood: { $sum: "$netamountsoldforthegood" },
            commission: { $sum: "$commission" },
            totalprofit: { $sum: "$profit" },
            totalTransaction: { $sum: 1 },
            createdAt: {$first :"createdAt"},
            netprofit: { $sum: "$profit" },
            saleType: { $first: "$saleType" },
            financeDetails: { $first: "$financeDetails" },
            totaltransaction: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id.CategoryId",
            foreignField: "_id",
            as: "categoryDetails"
          }
        },
        {
          $unwind: "$categoryDetails"
        },
        {
          $lookup: {
            from: database,
            localField: "_id.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
        {
          $lookup: {
            from: "actors",
            localField: "_id.sellerId",
            foreignField: "_id",
            as: "sellerDetails",
          },
        },
        {
          $unwind: "$sellerDetails",
        },
        {
          $lookup: {
            from: "shops",
            localField: "_id.shopId",
            foreignField: "_id",
            as: "shopDetails"
          }
        },
        {
          $project: {
            category: "$categoryDetails.category",
            productname: "$categoryDetails.itemName",
            productmodel: "$categoryDetails.itemModel",
            batchNumber: "$productDetails.batchNumber",
            productCost: "$productDetails.productCost",
            soldunits: "$_id.soldunits",
            shopname: "$shopDetails.name",
            shopAddress: "$shopDetails.address",
            commission: 1,
            soldprice: 1,
            netprofit: 1,
            totaltransaction: 1,
            saleType: 1,
            financeDetails: 1,
            netamountsoldforthegood: 1,
            sellername: "$sellerDetails.name",
            createdAt: "$_id.createdAt",
          },
        },
      ]);
      return {
        generalReport,
      };
    } catch (err) {
      console.log("error", err);
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


  async getReports({
    category,
    database,
    endDate,
    startDate,
    limit,
    page,
    skip,
  }) {
    try {
      const convertedCategoryId = new mongoose.Types.ObjectId(category);
      const fullAggregation = await salesDatabase.aggregate([
        {
          $addFields: {
            netSalesPrice: { $subtract: ["$soldprice", "$discount"] },
          },
        },
        {
          $match: {
            CategoryId: convertedCategoryId,
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalSoldUnits: { $sum: "$soldUnits" },
            totalNetSalesPrice: { $sum: "$netSalesPrice" },
            totalProfit: { $sum: "$profit" },
            commission: { $sum: "$commission" },
            totalTransactions: { $sum: 1 },
          },
        },
      ]);

      const overallTotals = fullAggregation[0] || {
        totalSoldUnits: 0,
        totalNetSalesPrice: 0,
        totalProfit: 0,
        commission: 0,
        totalTransactions: 0,
      };

      const salesReport = await salesDatabase.aggregate([
        {
          $addFields: {
            netSalesPrice: { $subtract: ["$soldprice", "$discount"] },
          },
        },
        {
          $match: {
            CategoryId: convertedCategoryId,
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              sellerId: "$sellerId",
              CategoryId: "$CategoryId",
              shopId: "$shopId",
              createdAt: "$createdAt"
            },
            totalSoldUnits: { $sum: "$soldUnits" },
            commission: { $sum: "$commission" },
            totalNetSalesPrice: { $sum: "$netSalesPrice" },
            totalProfit: { $sum: "$profit" },
            totalTransactions: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id.CategoryId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $lookup: {
            from: "actors",
            localField: "_id.sellerId",
            foreignField: "_id",
            as: "sellerDetails",
          },
        },
        { $unwind: "$sellerDetails" },
        {
          $lookup: {
            from: "shops",
            localField: "_id.shopId",
            foreignField: "_id",
            as: "shopDetails",
          },
        },
        { $unwind: "$shopDetails" },
        {
          $project: {
            sellerName: "$sellerDetails.name",
            productName: "$productDetails.itemName",
            productModel: "$productDetails.itemModel",
            shopName: "$shopDetails.name",
            totalProfit: 1,
            commission: 1,
            totalSoldUnits: 1,
            totalNetSalesPrice: 1,
            totalTransactions: 1,
          },
        },
        { $skip: skip },
        { $limit: limit },
        { $sort: { totalSoldUnits: -1 } },
      ]);
      return {
        overallTotals,
        salesReport,
        page,
        limit,
        totalPages: Math.ceil(salesReport.length / limit),
      };
    } catch (err) {
      console.log(err);
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

  async getShopSales({
    shopId,
    database,
    startDate,
    endDate,
  }) {
    try {
      const convertedShopId = new mongoose.Types.ObjectId(shopId)
      const shopSalesReport = await salesDatabase.aggregate([
        {
          $addFields: {
            netsalesprice: { $subtract: ["$soldprice", "$discount"] },
          },
        },
        {
          $match: {
            shopId: convertedShopId,
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              productId: "$productId",
              sellerId: "$sellerId",
              CategoryId: "$CategoryId",
              createdAt: "$createdAt",
              shopId: "$shopId"
            },
            soldprice: { $sum: "$soldprice" },
            netprofit: { $sum: "$profit" },
            commission: { $sum: "$profit" },
            totalsoldunits: { $sum: "$soldUnits" },
            totalnetprice: { $sum: "$netsalesprice" },
            totaltransaction: { $sum: 1 },
          },
        },
        {

          $lookup: {
            from: "shops",
            localField: "_id.shopId",
            foreignField: "_id",
            as: "shopDetails"
          }
        },
        {
          $unwind: "$shopDetails"
        },
        {
          $lookup: {
            from: "products",
            localField: "_id.CategoryId",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        { $unwind: "$categoryDetails" },
        {
          $lookup: {
            from: database,
            localField: "_id.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: "$productDetails" },
        {
          $lookup: {
            from: "actors",
            localField: "_id.sellerId",
            foreignField: "_id",
            as: "sellerDetails",
          },
        },
        { $unwind: "$sellerDetails" },
        {
          $project: {
            sellername: "$sellerDetails.name",
            productname: "$categoryDetails.itemName",
            productmodel: "$categoryDetails.itemModel",
            productcost: "$productDetails.productcost",
            batchNumber: "$productDetails.batchNumber",
            category: "$categoryDetails.category",
            createdAt: "$_id.createdAt",
            totalsoldunits: 1,
            soldprice: 1,
            totalnetprice: 1,
            netprofit: 1,
            totaltransaction: 1,
          },
        },
      ]);
      return {
        shopSalesReport
      };
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

  async getProductSalesOnEachShop({ shopname, productId, startdate, endDate }) {
    let startDateFilter = startdate ? new Date(startdate) : null;
    let endDateFilter = endDate ? new Date(endDate) : null;

    let matchStage = {
      shopname: shopname,
      productId: new ObjectId(productId),
    };
    if (startDateFilter && endDateFilter) {
      matchStage.createdAt = {
        $gte: startDateFilter,
        $lte: endDateFilter,
      };
    } else if (startDateFilter) {
      matchStage.createdAt = {
        $gte: startDateFilter,
      };
    } else if (endDateFilter) {
      matchStage.createdAt = {
        $lte: endDateFilter,
      };
    }

    const salesreport = await salesDatabase.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: "$shopname",
          totalSales: { $sum: "$soldprice" },
          totalUnits: { $sum: "$soldunits" },
          totalCommission: { $sum: "$commission" },
          totalProfit: { $sum: "$profit" },
          date: { $max: "$updatedAt" },
        },
      },
      {
        $project: {
          _id: 0,
          shopName: "$_id",
          date: 1,
          totalSales: 1,
          totalUnits: 1,
          totalProfit: 1,
          totalCommission: 1,
        },
      },
    ]);

    return salesreport;
  }
  async getUserSalesById(userId, startDate, endDate, item) {
    try {
      // Validate the sellerId
      const convertedSellerId = new mongoose.Types.ObjectId(userId)
      const usermanagementSalesReport = await salesDatabase.aggregate([
        {
          $addFields: {
            netsalesprice: { $subtract: ["$soldprice", "$discount"] },
          },
        },
        {
          $match: {
            sellerId: convertedSellerId,
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              productId: "$productId",
              sellerId: "$sellerId",
              shopId: "$shopId",
              CategoryId: "$CategoryId",
              createdAt: "$createdAt",
            },
            soldprice: { $sum: "$soldprice" },
            netprofit: { $sum: "$profit" },
            commission: { $sum: "$commission" },
            totalsoldunits: { $sum: "$soldUnits" },
            totalnetprice: { $sum: "$netsalesprice" },
            totaltransaction: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id.CategoryId",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        { $unwind: "$categoryDetails" },
        {
          $lookup: {
            from: item,
            localField: "_id.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            productname: "$categoryDetails.itemName",
            productmodel: "$categoryDetails.itemModel",
            productcost: "$productDetails.productcost",
            batchNumber: "$productDetails.batchNumber",
            category: "$categoryDetails.category",
            createdAt: "$_id.createdAt",
            totalsoldunits: 1,
            soldprice: 1,
            totalnetprice: 1,
            netprofit: 1,
            commission: 1,
            totaltransaction: 1,
          },
        },
      ]);
      return {
        usermanagementSalesReport
      }
    } catch (err) {
      throw new Error(`Failed to fetch sales data: ${err.message}`);
    }
  }

  async payCommission(salesId, updatedData) {
    return await salesDatabase.findByIdAndUpdate(salesId, updatedData, {
      new: true,
    });
  }

  async updatecategoryrevenue(category, amount) {
    try {
      const categoryRevenue = await categoryrevenue.findOne({ category });
      if (categoryRevenue) {
        categoryRevenue.totalCommission += amount;
        await categoryRevenue.save();
      } else {
        await categoryrevenue.create({
          category,
          totalRevenue: 0,
          totalCommission: amount,
        });
      }
    } catch (err) {
      console.log("error", err);
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
  async getFinancerReport(report) {
    try {

      const { startDate, endDate, financer } = report

      const start = new Date(startDate);
      const end = new Date(endDate);

      console.log("sales", await salesDatabase.find({}))
      const sales = await salesDatabase.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            'financeDetails.financer': financer,
            'financeDetails.financeStatus': "pending"
          }
        },
        {
          $group: {
            _id: {
              CategoryId: "$CategoryId",
              productId: "$productId",
            },
            soldprice: { $first: '$soldprice' },
            customerName: { $first: '$customerName' },
            owner: { $first: '$client' },
            customerphonenumber: { $first: '$customerphonenummber' },
            financeDetails: { $first: '$financeDetails' },
            createdAt: { $first: '$createdAt' },

          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id.CategoryId',
            foreignField: "_id",
            as: "categoryDetails",
          }
        },
        { $unwind: "$categoryDetails" },
        {
          $lookup: {
            from: "mobiles",
            localField: "_id.productId",
            foreignField: "_id",
            as: "mobileDetails"
          }
        },
        { $unwind: "$mobileDetails" },

        {
          $project: {
            productName: "$categoryDetails.itemName",
            productModel: "$categoryDetails.itemModel",
            productType: "$mobileDetails.productType",
            IMEI: "$mobileDetails.IMEI",
            serialNumber: "$mobileDetails.serialNumber",
            soldprice: 1,
            financeDetails: 1,
            customerName: 1,
            owner: 1,
            customerphonenumber: 1,
            createdAt: 1
          }
        }

      ]);

      return sales
    }
    catch (err) {
      console.log("error", err);
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
  async getCategoryRevenues() {
    return await categoryrevenue.find({});
  }
}

export { Sales };
