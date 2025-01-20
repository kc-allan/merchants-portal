import { Sales } from "../databases/repository/sales-repository.js";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { usermanagemenRepository } from "../databases/repository/usermanagement-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";

class salesmanagment {
  constructor() {
    this.user = new usermanagemenRepository();
    this.inventory = new InventorymanagementRepository();
    this.shop = new ShopmanagementRepository();
    this.sales = new Sales();
    this.mobile = new phoneinventoryrepository();
    this.category = new CategoryManagementRepository();
  }


  async Accessorysales(salesDetail) {
    try {
      const {
        customerName,
        customerEmail,
        customerphonenumber,
        CategoryId,
        productId,
        shopname,
        soldUnits,
        soldprice,
        sellerId,
      } = salesDetail;

      let [seller, shopFound, productAvailability] = await Promise.all([
        this.user.findUserById({ id: sellerId }),
        this.shop.findShop({ name: shopname }),
        this.inventory.findProductById(productId),
      ]);
      let saleType;
      const quantity = parseInt(soldUnits, 10);

      if (!shopFound) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          ` ${shopname} shop NOT FOUND`
        )
      }
      if (!seller) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "seller not found"
        );
      }
      if (seller.assignedShop === null) {
        throw new APIError(
          "seller is not assigned to any shop",
          STATUS_CODE.UNAUTHORIZED,
          "you currently not assigned to any  shop"
        )
      }

      if (seller.assignedShop.name !== shopname) {
        throw new APIError(
          "unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          `you are not authorized to make sales in ${shopname} shop`
        );
      }
      if (seller.workingstatus === "suspended") {
        throw new APIError(
          "unauthorised",
          STATUS_CODE.UNAUTHORIZED,
          "you are currently suspendend"
        );
      } else if (seller.workingstatus === "inactive") {
        throw new APIError(
          "unauthorised",
          STATUS_CODE.UNAUTHORIZED,
          "you are currently inactive"
        );
      }
      if (!productAvailability) {
        throw new APIError(
          "Product not found",
          STATUS_CODE.NOT_FOUND,
          "Product not found"
        );
      }

      if (productAvailability.stockStatus === "deleted" || productAvailability.stockStatus === "suspended") {
        throw new APIError(
          "product not available",
          STATUS_CODE.NOT_FOUND,
          `Product ${productAvailability.CategoryId.itemName} model ${productAvailability.CategoryId.itemModel} is currently ${productAvailability.stockStatus}`
        )
      }
      const shopId = shopFound.id;
      const shopName = shopFound.name;
      const filteredStockItem = shopFound.stockItems.filter((item) => {
        return item.stock !== null
      })
      const stockItem = filteredStockItem.find((item) =>
        item.stock._id.toString() === productId.toString()
      );
      if (!stockItem) {
        throw new APIError(
          "Product not available in the shop",
          STATUS_CODE.NOT_FOUND,
          `${productAvailability.CategoryId.itemName} model ${productAvailability.CategoryId.itemModel} not available in the shop`
        )
      }
      if (stockItem.quantity < soldUnits) {
        throw new APIError(
          "Insufficient accessory to sell",
          STATUS_CODE.BAD_REQUEST,
          `Not enough stock of ${productAvailability.CategoryId.itemName} model ${productAvailability.CategoryId.itemModel}`
        )
      }


      //update shop sales
      const updatedShop = await this.shop.updateSalesOfAccessory(shopId, productId, soldUnits)
      //update the overall stock
      const updatedSales = this.inventory.updateSalesAccessoryStock({
        id: productAvailability.id.toString(),
        shopName: shopName,
        quantity: soldUnits,
        seller: seller.name
      });

      if (!updatedSales) {
        throw new APIError(
          "Error updating stock",
          STATUS_CODE.INTERNAL_ERROR,
          "Error updating stock"
        );
      }

      const commissionAmount =
        (soldprice * productAvailability.commission) / 100;

      //calculate the profit

      const totalrevenue = soldprice;
      const costperunit = productAvailability.productcost;
      const totalcost = soldUnits * costperunit;
      const profit = totalrevenue - totalcost - commissionAmount;

      //update sales person sales history
      await this.user.updateUserSales({
        id: seller.id,
        email: seller.email,
        quantity: soldUnits,
        shopId: shopId,
        productId: productAvailability.id,
        categoryId: productAvailability.CategoryId,
        price: soldprice,
      });
      const confirmedSales = {
        ...salesDetail,
        profit: profit,
        commission: commissionAmount,
        shopId: shopId,
        saleType: "direct",
        shoplocation: shopFound.address,
        customername: customerName,
        customeremail: customerEmail,
        customerphonenumber: customerphonenumber,
      };
      const recordSales = await this.sales.createnewsales({
        salesDetails: confirmedSales,
      });
      // const salesId = recordSales.id;
      // await this.category.updateSalesOfProduct({
      //   id: CategoryId,
      //   salesId: salesId,
      // });
      return recordSales;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("internal server", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }

  async MobileSales(saledetail) {
    try {
      const {
        customerName,
        customerEmail,
        customerphonenumber,
        productId,
        shopname,
        soldprice,
        sellerId,
      } = saledetail;
      let salesType;
      let financeStatus
      const soldUnits = 1;
      let [userfound, shopfound, productAvailability] = await Promise.all([
        this.user.findUserById({ id: sellerId }),
        this.shop.findShop({ name: shopname }),
        this.mobile.findPhoneById({ id: productId }),
      ]);
      if (!userfound) {
        throw new APIError("seller not found", STATUS_CODE.NOT_FOUND, null);
      }

      if (!productAvailability) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "product not found"
        )
      }

      if (userfound.assignedShop === null) {
        throw new APIError(
          "seller is not assigned to any shop",
          STATUS_CODE.UNAUTHORIZED,
          "you currently not assigned to any  shop"
        )
      }
      if (userfound.assignedShop.name !== shopname || userfound.assignedShop === null) {
        throw new APIError(
          "unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "you are not authorized to make sales in this shop"
        );
      }
      if (userfound.workingstatus === "suspendend") {
        throw new APIError(
          "unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "you are currently suspendend"
        );
      } else if (userfound.workingstatus === "inactive") {
        throw new APIError(
          "unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "you currently inactive"
        );
      }
      const filteredPhoneItem = shopfound.phoneItems.filter((item) => {
        return item.stock !== null
      })
      const stockItem = filteredPhoneItem.find((item) =>
        item.stock._id.toString() === productId.toString()
      );

      if (!stockItem) {
        throw new APIError(
          "product not available in the shop",
          STATUS_CODE.NOT_FOUND,
          `The  ${productAvailability.CategoryId.itemName} model ${productAvailability.CategoryId.itemModel} is not available in this shop`
        )
      }
      if (stockItem.quantity < soldUnits) {
        throw new APIError(
          "Insufficient stock in the shop",
          STATUS_CODE.BAD_REQUEST,
          `${productAvailability.CategoryId.itemName} model ${productAvailability.CategoryId.itemModel} is insufficient`
        );
      }
      //update shop inventory
      const shopId = shopfound.id;
      const updatedShopSales = await this.shop.updateSalesOfPhone(shopId, productId, soldUnits);
      if (!updatedShopSales) {
        throw new APIError(
          "internal error",
          STATUS_CODE.INTERNAL_ERROR,
          "internal error"
        );
      }

      //update the overall products
      const updateStock = await this.mobile.updatesalesofaphone({
        id: productAvailability.id,
        shopId: updatedShopSales.id,
        price: soldprice,
        status: "sold",
        quantity: soldUnits,
        sellerId: sellerId,
        seller: userfound.email,
      });

      const commissionAmount =
        (soldprice * productAvailability.commission) / 100;

      //calculate the profit
      salesType = (productAvailability.financeDetails.financer !== "captech") ? "finance" : "direct";
      financeStatus = (salesType === "finance") ? "pending" : "paid";
      const costperunit = productAvailability.productcost;
      const totalrevenue = soldUnits * soldprice;
      const totalcost = soldUnits * costperunit;
      const profit = totalrevenue - totalcost - commissionAmount;
      const confirmedSales = {
        ...saledetail,
        profit: profit,
        soldUnits: 1,
        commission: commissionAmount,
        shopId: shopId,
        saleType: salesType,
        financeDetails: {
          financer: productAvailability.financeDetails.financer,
          financeAmount: productAvailability.financeDetails.financeAmount,
          financeStatus: financeStatus
        },
        shoplocation: updatedShopSales.address,
        customername: customerName,
        customeremail: customerEmail,
        customerphonenumber: customerphonenumber,
      };
      const recordSales = await this.sales.createnewsales({
        salesDetails: confirmedSales,
      });
      const updateProductSales = await this.category.updateSalesOfProduct({
        id: productAvailability.id,
        sales: recordSales.id,
      });
      await userfound.save();
      return recordSales;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("internal errror", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }
  async generategeneralsales({ startDate, endDate, page, limit }) {
    try {
      const database = ["mobiles", "accessories"];
      const skip = (page - 1) * limit;
      const generalsalespromises = database.map(async (item) => {
        return this.sales.findSales({
          database: item,
          startdate: startDate,
          endDate: endDate,
          skip: skip,
          limit: limit,
        });
      });

      const generalSalesresolve = await Promise.all(generalsalespromises);


      const combinedSales = generalSalesresolve.flatMap((result) => result.generalReport);

      const analytics = await this.analyseSalesMetric(combinedSales)
      const finance = combinedSales.filter((sale) => { return sale.saleType === "finance" });
      const fullfilledSales = combinedSales.filter((sale) => { return sale.saleType !== "finance" || sale.financeDetails.financeStatus !== "pending" })

      const sortedSales = combinedSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const paginatedSales = sortedSales.slice(skip, skip + limit);

      const salesPerMonth = combinedSales.reduce((acc, sale) => {
        const month = new Date(sale.createdAt).toLocaleString('default', { month: 'short' });
        acc[month] = acc[month] ? acc[month] + sale.soldprice : sale.soldprice;
        return acc;
      }, {});

      const salesPerMonthArray = Object.entries(salesPerMonth)
        .map(([month, sales]) => ({ month, sales }))
        .sort((a, b) => new Date(a.month) - new Date(b.month))
        .reverse();

      console.log("salesPerMonthArray", salesPerMonthArray);



      const totalSales = fullfilledSales.reduce((acc, sale) => acc + sale.soldprice, 0);
      const totalProfit = fullfilledSales.reduce((acc, sale) => acc + sale.totalprofit, 0);
      const financeSales = finance.reduce((acc, sale) => acc + sale.financeDetails.financeAmount, 0);

      if (!combinedSales.length) {
        throw new APIError(
          "No sales data found",
          STATUS_CODE.NOT_FOUND,
          "No sales data seen yet"
        );
      }

      return {
        sales: paginatedSales,
        analytics: analytics,
        salesPerMonth: salesPerMonthArray,
        totalSales,
        totalProfit,
        financeSales: financeSales,
        totalPages: Math.ceil(combinedSales.length / limit),
        currentPage: page,
      };
    } catch (err) {
      console.error("Error generating general sales:", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("Internal error", STATUS_CODE.INTERNAL_ERROR, err.message);
    }
  }

  async getSalesDownloads(salesDetails) {
    try {
      const { financer, startDate, endDate, page, limit } = salesDetails;
      const report = { financer, startDate, endDate, limit, page };
      const sales = await this.sales.getFinancerReport(report);
      if (!sales || sales.length === 0) {
        throw new APIError("Not found", STATUS_CODE.NOT_FOUND, "SALES NOT FOUND");
      }
      const totalSales = sales.reduce((acc, sale) => acc + sale.soldprice, 0)
      return { sales, totalSales };
    } catch (err) {
      console.error('Error generating PDF:', err);
      if (err instanceof APIError) {
        throw err
      }
      throw new Error('Failed to generate PDF report.');
    }
  }


  async generateCategorySales(salesDetails) {
    try {
      const { categoryId, database, startDate, endDate, page, limit } = salesDetails
      const skip = (page - 1) * limit;
      const report = {
        category: categoryId,
        database: database,
        startDate: startDate,
        endDate: endDate,
        limit: limit,
        page: page,
        skip: skip,
      };

      const generalReport = await this.sales.getReports(report);

      if (
        !generalReport.salesReport ||
        generalReport.salesReport.length === 0
      ) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "no sales made yet"
        );
      }

      return generalReport;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }

      throw new APIError(
        "internal error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "internal server error"
      );
    }
  }

  async generateShopSales({
    shopname,
    startDate,
    endDate,
    page,
    limit,
  }) {
    try {
      const skip = (page - 1) * limit;
      const database = ["accessories", "mobiles"]
      const shopfound = await this.shop.findShop({ name: shopname });

      if (!shopfound) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "shop not found"
        );
      }

      const generalSalesforTheShop = database.map(async (item) => {
        const shopId = shopfound._id;
        const report = {
          shopId: shopId,
          database: item,
          startDate: startDate,
          endDate: endDate,
          limit: limit,
          page: page,
          skip: skip,
        };
        return await this.sales.getShopSales(report);
      })
      const generalresolve = await Promise.all(generalSalesforTheShop)
      const combinedSales = generalresolve.flatMap((result) => result.shopSalesReport);

      if (!combinedSales.length) {
        throw new APIError(
          "No sales data found",
          STATUS_CODE.NOT_FOUND,
          "No sales data seen yet"
        );
      }
      const analytics = await this.analyseSalesMetric(combinedSales)

      const sortedSales = combinedSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // Paginate combined results
      const paginatedSales = sortedSales.slice(skip, skip + limit);

      // Calculate total sales and total profit
      const totalSales = combinedSales.reduce((acc, sale) => acc + sale.soldprice, 0);
      const totalProfit = combinedSales.reduce((acc, sale) => acc + sale.netprofit, 0);
      return {
        sales: paginatedSales,
        analytics: analytics,
        totalSales,
        totalProfit,
        totalPages: Math.ceil(combinedSales.length / limit),
        currentPage: page,
      };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "internal error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "internal server  error"
      );
    }
  }
  async analyseSalesMetric(salesData) {
    try {
      const productMetric = {};
      const sellerMetric = {};

      await salesData.map(sale => {
        const { soldprice, netprofit, _id, totaltransaction } = sale;
        const { sellerId, CategoryId } = _id;

        if (!productMetric[CategoryId]) {

          productMetric[CategoryId] = {
            productName: sale.productname,
            totalSales: 0,
            totaltransacted: 0,
            netprofit: 0
          }
        }

        productMetric[CategoryId].totalSales += soldprice;
        productMetric[CategoryId].totaltransacted += totaltransaction;
        productMetric[CategoryId].netprofit += netprofit;

        if (!sellerMetric[sellerId]) {
          sellerMetric[sellerId] = {
            sellerName: sale.sellername,
            totalSales: 0,
            netprofit: 0,
            totaltransacted: 0
          }
        }
        sellerMetric[sellerId].totalSales += soldprice;
        sellerMetric[sellerId].netprofit += netprofit;
        sellerMetric[sellerId].totaltransacted += totaltransaction;
      })
      const productAnalytics = Object.values(productMetric).sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);
      const totalProducts = Object.entries(productMetric).length;
      const sellerAnalytics = Object.values(sellerMetric).sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);
      const totalSellers = Object.values(sellerMetric).length;
      return { sellerAnalytics, productAnalytics, totalProducts, totalSellers }
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "internal error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "internal server  error"
      );
    }
  }
  async getUserSales(userId, startDate, endDate, page, limit) {
    try {
      const database = ["accessories", "mobiles"];
      const skip = (page - 1) * limit;
      const seller = await this.user.findUserById({ id: userId });
      if (!seller) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "Seller not found"
        )
      }
      const sales = database.map(async (item) => {
        return await this.sales.getUserSalesById(
          userId,
          startDate,
          endDate,
          item
        )
      })
      const resolvedSales = await Promise.all(sales);


      const combinedSales = await resolvedSales.flatMap((result) => result.usermanagementSalesReport)
      if (!combinedSales.length) {
        throw new APIError(
          "No sales data found",
          STATUS_CODE.NOT_FOUND,
          "No sales data seen yet"
        );
      }
      const sortedSales = combinedSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const paginatedSales = sortedSales.slice(skip, skip + limit);

      const totalSales = combinedSales.reduce((acc, sale) => acc + sale.soldprice, 0);
      const totalProfit = combinedSales.reduce((acc, sale) => acc + sale.netprofit, 0);
      return {
        sales: paginatedSales,
        totalSales,
        totalProfit,
        totalPages: Math.ceil(combinedSales.length / limit),
        currentPage: page,
      };
    } catch (err) {
      console.log("err", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new Error(`Error in service layer: ${err.message}`);
    }
  }
  async paymentofcommission(salesId, amount) {
    try {
      const sale = await this.sales.findSalesById(salesId);
      console.log("sales", sale);
      if (amount > sale.commission) {
        throw new Error("Amount exceeds the commission due");
      } else if (amount - sales.commision !== 0) {
        const updatedCommission = sale.commission - amount;
        sale.commission = updatedCommission;
        sale.commissionStatus = " still awaiting";
      }
      const updatedCommission = sale.commission - amount;
      sale.commission = updatedCommission;
      sale.commissionStatus = "paid";
      const updatedSale = await this.sales.payCommission(salesId, sale);

      // Record the commission paid in the category revenue
      await this.sales.updatecategoryrevenue(sale.category, amount);

      return updatedSale;
    } catch (err) {
      console.log("err", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new Error(`Error in service layer: ${err.message}`);
    }
  }
  async calculateRevenueByCategory() {
    try {
      const categoryRevenues = await salesRepository.getCategoryRevenues();

      const netIncome = categoryRevenues.map((categoryRevenue) => ({
        category: categoryRevenue.category,
        totalRevenue: categoryRevenue.totalRevenue,
        totalCommission: categoryRevenue.totalCommission,
        netIncome:
          categoryRevenue.totalRevenue - categoryRevenue.totalCommission,
      }));
      return netIncome;
    } catch (err) {
      console.log("err", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new Error(`Error in service layer: ${err.message}`);
    }
  }
}

export { salesmanagment };
