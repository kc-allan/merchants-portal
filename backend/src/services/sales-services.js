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
        seller,
        transferId
      } = salesDetail;
      const stockId = parseInt(productId, 10);
      const sellerId = parseInt(seller, 10);
      const categoryId = parseInt(CategoryId, 10);
      const quantity = parseInt(soldUnits, 10);
      const productTransferId = parseInt(transferId)
      let [userfound, shopFound, productAvailability, assignedShop] = await Promise.all([
        this.user.findUserById({ id: sellerId }),
        this.shop.findShop({ name: shopname }),
        this.inventory.findProductById(stockId),
        this.user.findAssignedShop(sellerId)
      ]);
      let saleType;


      if (!shopFound) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          ` ${shopname} shop NOT FOUND`
        );
      }
      const shopId = parseInt(shopFound.id, 10);

      if (!userfound) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "seller not found"
        );
      }
      const assigned = assignedShop.filter(
        (assignment) => assignment.status === "assigned"
      );
      console.log("assignedeieihif", assigned),
        console.log("userfound", userfound);
      if (assigned[0].shops.shopName !== shopname) {
        throw new APIError(
          "unauthorised to make sales",
          STATUS_CODE.UNAUTHORIZED,
          "not allowed to make sales in this shop"
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

      const filteredPhoneItem = shopFound.accessoryItems.filter((item) => {
        return item.accessoryID !== null;
      });
      const stockItem = filteredPhoneItem.find(
        (item) => item.accessoryID === stockId && item.transferId === productTransferId
      );
      if (!stockItem) {
        throw new APIError(
          "Product not available in the shop",
          STATUS_CODE.NOT_FOUND,
          `${productAvailability.categories.itemName} model ${productAvailability.categories.itemModel} not available in the shop`
        );
      }
      if (stockItem.quantity < quantity) {
        throw new APIError(
          "Insufficient accessory to sell",
          STATUS_CODE.BAD_REQUEST,
          `Not enough stock of ${productAvailability.categories.itemName} model ${productAvailability.categories.itemModel}`
        );
      }
      if (stockItem.status === "pending") {
        throw new APIError(
          "stock not available for sale",
          STATUS_CODE.BAD_REQUEST,
          "stock not available for sale"
        )
      }
      //update shop sales
      const updatedShop = await this.shop.updateSalesOfAccessory(
        shopId,
        productTransferId,
        soldUnits
      );
      //update the overall stock
      const commissionAmount = parseInt(productAvailability.commission, 10);
      //calculate the profit

      const totalrevenue = soldprice;
      const costperunit = productAvailability.productCost;
      const totalcost = soldUnits * costperunit;
      const profit = totalrevenue - totalcost - commissionAmount;

      //update sales person sales history

      const confirmedSales = {
        productID: stockId,
        shopID: shopId,
        sellerId: sellerId,
        profit: profit,
        soldPrice: soldprice,
        quantity: 1,
        commission: commissionAmount,
        commisssionStatus: "pending",
        shopID: shopId,
        categoryId: categoryId,
        finance: financeDetails.id,
        financer: financeDetails.financer,
        financeAmount: financeDetails.financeAmount,
        financeStatus: financeDetails.financeStatus,
        paymentmethod: paymentmethod,
        salesType: typeofFinance,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhoneNumber: customerphonenumber,
      };
      const recordSales = await this.sales.createnewAccessoriesales(confirmedSales);

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
        seller,
        paymentmethod,
        CategoryId,
      } = saledetail;

      const soldUnits = 1;
      const stockId = parseInt(productId, 10);
      const sellerId = parseInt(seller, 10);
      const categoryId = parseInt(CategoryId, 10);
      let [
        userfound,
        shopfound,
        productAvailability,
        assignedShop,
        financeDetails,
      ] = await Promise.all([
        this.user.findUserById({ id: sellerId }),
        this.shop.findShop({ name: shopname }),
        this.mobile.findItem(stockId),
        this.user.findAssignedShop(sellerId),
        this.mobile.findMobileFinance(stockId),
      ]);
      if (!userfound) {
        throw new APIError("seller not found", STATUS_CODE.NOT_FOUND, null);
      }

      if (!productAvailability) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "product not found"
        );
      }

      const assigned = assignedShop.filter(
        (assignment) => assignment.status === "assigned"
      );
      console.log("assignedeieihif", assigned),
        console.log("userfound", userfound);
      if (assigned[0].shops.shopName !== shopname) {
        throw new APIError(
          "unauthorised to make sales",
          STATUS_CODE.UNAUTHORIZED,
          "not allowed to make sales in this shop"
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
      const filteredPhoneItem = shopfound.mobileItems.filter((item) => {
        return item.mobileID !== null;
      });
      const stockItem = filteredPhoneItem.find(
        (item) => item.mobileID === stockId
      );
      console.log("stokc", stockItem);
      if (!stockItem) {
        throw new APIError(
          "product not available in the shop",
          STATUS_CODE.NOT_FOUND,
          `the product is not found in ${shopname} shop`
        );
      }
      console.log("soldunits", soldUnits);
      if (
        (stockItem.quantity < 1 && stockItem.status === "transferd") ||
        stockItem.status === "pending"
      ) {
        throw new APIError(
          "stock not available for sale",
          STATUS_CODE.BAD_REQUEST,
          `stock not available  in ${shopname}`
        );
      }
      //update shop inventory
      const shopId = parseInt(shopfound.id, 10);
      const updatedShopSales = await this.shop.updateSalesOfPhone(
        shopId,
        stockId,
        soldUnits
      );
      console.log("updatedShoSales", updatedShopSales);
      let typeofFinance =
        financeDetails.financer === "captech" ? "direct" : "finance";
      //update the overall products
      const updatesOnPhone = await Promise.all([
        this.mobile.updatesalesofaphone({
          id: stockId,
          sellerId: sellerId,
          status: "sold",
        }),
        this.mobile.updateSoldPhone(stockId),
      ]);

      const commissionAmount = parseInt(productAvailability.commission, 10);

      //calculate the profit
      const costperunit = productAvailability.productCost;
      const totalrevenue = soldUnits * soldprice;
      const totalcost = soldUnits * costperunit;
      const profit = totalrevenue - totalcost - commissionAmount;
      const confirmedSales = {
        productID: stockId,
        shopID: shopId,
        sellerId: sellerId,
        profit: profit,
        soldPrice: soldprice,
        quantity: 1,
        commission: commissionAmount,
        commisssionStatus: "pending",
        shopID: shopId,
        categoryId: categoryId,
        finance: financeDetails.id,
        financer: financeDetails.financer,
        financeAmount: financeDetails.financeAmount,
        financeStatus: financeDetails.financeStatus,
        paymentmethod: paymentmethod,
        salesType: typeofFinance,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhoneNumber: customerphonenumber,
      };
      const recordSales = await this.sales.createnewMobilesales(confirmedSales);
      return recordSales;
    } catch (err) {
      console.log("err", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("internal errror", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }

  async generategeneralsales({ startDate, endDate, page, limit }) {
    try {
      const salesTables = ["mobilesales", "accessorysales"];
      const skip = (page - 1) * limit;

      const generalsalespromises = salesTables.map(async (table) => {
        return this.sales.findSales({
          salesTable: table,
          startDate,
          endDate,
        });
      });

      const generalSalesResolve = await Promise.all(generalsalespromises);
      const combinedSales = generalSalesResolve.flatMap(
        (result) => result.generalReport
      );
      //console.log("combinedSales", combinedSales);
      const transformedSales = combinedSales.map((sale) => ({
        soldprice: sale._sum.soldPrice,
        commission: sale._sum.commission,
        totalprofit: sale._sum.profit,
        totaltransaction: sale._count._all,
        productDetails: {
          productID: sale.productDetails?.id,
          batchNumber: sale.productDetails?.batchNumber,
          productCost: sale.productDetails?.productCost,
          productType: sale.productDetails?.phoneType || "accessory",
        },
        categoryDetails: {
          categoryId: sale.categoryDetails?.id,
          category: sale.categoryDetails?.itemName || "Accessory",
          itemName: sale.categoryDetails?.itemName,
          itemModel: sale.categoryDetails?.itemModel,
          brand: sale.categoryDetails?.brand,
        },
        shopDetails: {
          id: sale.shopDetails?.id,
          name: sale.shopDetails?.shopName,
          address: sale.shopDetails?.address,
        },
        sellerDetails: {
          name: sale.sellerDetails?.name,
          id: sale.sellerDetails?.id,
        },
        saleType:
          sale.financeDetails.financeStatus !== "N/A" ? "finance" : "direct",
        financeDetails: sale.financeDetails,
        createdAt: sale.createdAt,
      }));

      //console.log("transformedSales", transformedSales);
      // Rest of your existing processing logic
      const analytics = await this.analyseSalesMetric(transformedSales);
      const finance = transformedSales.filter(
        (sale) =>
          sale.saleType === "finance" &&
          sale.financeDetails.financeStatus === "pending"
      );
      const fullfilledSales = transformedSales.filter((sale) => {
        return (
          sale.saleType !== "finance" ||
          sale.financeDetails.financeStatus !== "pending"
        );
      });

      const financeSales = finance.reduce(
        (acc, sale) => acc + sale.financeDetails.financeAmount,
        0
      );
      const totalProfit = fullfilledSales.reduce(
        (acc, sale) => acc + sale.totalprofit,
        0
      );
      const totalSales = combinedSales.reduce(
        (acc, sale) => acc + sale._sum.soldPrice,
        0
      );
      const totalCommission = combinedSales.reduce(
        (acc, sale) => acc + sale._sum.commission,
        0
      );
      //console.log("$%@@@totalcommission", totalCommission)
      const paginatedSales = transformedSales.slice(skip, skip + limit);
      console.log("#$#%$", paginatedSales)
      return [
        {
          sales: {
            sales: paginatedSales,
            totalSales,
            totalCommission,
            totalProfit,
            financeSales: financeSales,
            totalPages: Math.ceil(transformedSales.length / limit),
            currentPage: page,
          },
          analytics: {
            analytics: analytics,
          },
        },
      ];
    } catch (err) {
      console.log("err", err);
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

  async generateCategorySales(salesDetails) {
    try {
      const { categoryId, startDate, endDate, page, limit } = salesDetails;
      const skip = (page - 1) * limit;

      const generalSalesData = await this.generategeneralsales({
        startDate,
        endDate,
        page,
        limit,
      });

      const allSales = generalSalesData[0].sales.sales;

      const fullfilledSales = allSales.filter(
        (sale) => sale.categoryDetails.categoryId === categoryId
      );
      const filteredSales = fullfilledSales.filter((sale) => {
        return (
          sale.saleType !== "finance" ||
          sale.financeDetails.financeStatus !== "pending"
        );
      });
      console.log("filterd", filteredSales);
      const paginatedSales = fullfilledSales.slice(skip, skip + limit);
      const transformSales = (sales) => {
        return sales.map((sale) => ({
          soldprice: sale.soldprice,
          netprofit: sale.totalprofit,
          commission: sale.commission,
          productcost: sale.productDetails.productCost,
          productmodel: sale.categoryDetails.itemModel,
          productname: sale.categoryDetails.itemName,
          totalnetprice: sale.soldprice,
          totalsoldunits: sale.totaltransaction,
          totaltransaction: sale.totaltransaction,
          _id: {
            productId: sale.productDetails.productID,
            sellerId: sale.sellerDetails.id,
            shopId: sale.shopDetails.id,
          },
          financeDetails: sale.financeDetails,
          CategoryId: sale.categoryDetails.categoryId,
          createdAt: sale.createdAt,
          batchNumber: sale.productDetails.batchNumber,
          category: sale.productDetails.productType,
        }));
      };

      const transformedSales = transformSales(paginatedSales);

      const totalSales = fullfilledSales.reduce(
        (acc, sale) => acc + sale.soldprice,
        0
      );
      const totalCommission = fullfilledSales.reduce(
        (acc, sale) => acc + sale.commission,
        0
      );
      const totalProfit = filteredSales.reduce(
        (acc, sale) => acc + sale.totalprofit,
        0
      );
      const financeSales = fullfilledSales
        .filter(
          (sale) =>
            sale.saleType === "finance" &&
            sale.financeDetails.financeStatus === "pending"
        )
        .reduce((acc, sale) => acc + sale.financeDetails.financeAmount, 0);

      return {
        sales: {
          sales: transformedSales,
          totalSales,
          totalCommission,
          totalProfit,
          financeSales,
          totalPages: Math.ceil(fullfilledSales.length / limit),
          currentPage: page,
        },
        analytics: {
          analytics: await this.analyseSalesMetric(fullfilledSales),
        },
      };
    } catch (err) {
      console.error("Error generating category sales:", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Internal error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Internal server error"
      );
    }
  }
  async generateShopSales(salesDetails) {
    try {
      const { shopId, startDate, endDate, page, limit } = salesDetails;
      const skip = (page - 1) * limit;
      const generalSalesData = await this.generategeneralsales({
        startDate,
        endDate,
        page,
        limit,
      });

      const allSales = generalSalesData[0].sales.sales;
      console.log("allsales", allSales);
      const fullfilledSales = allSales.filter(
        (sale) => sale.shopDetails.id === shopId
      );
      const filteredSales = fullfilledSales.filter((sale) => {
        return (
          sale.saleType !== "finance" ||
          sale.financeDetails.financeStatus !== "pending"
        );
      });
      console.log("filterd", filteredSales);
      const paginatedSales = fullfilledSales.slice(skip, skip + limit);
      const transformSales = (sales) => {
        return sales.map((sale) => ({
          soldprice: sale.soldprice,
          netprofit: sale.totalprofit,
          commission: sale.commission,
          productcost: sale.productDetails.productCost,
          productmodel: sale.categoryDetails.itemModel,
          productname: sale.categoryDetails.itemName,
          totalnetprice: sale.soldprice,
          totalsoldunits: sale.totaltransaction,
          totaltransaction: sale.totaltransaction,
          _id: {
            productId: sale.productDetails.productID,
            sellerId: sale.sellerDetails.id,
            shopId: sale.shopDetails.id,
          },
          financeDetails: sale.financeDetails,
          CategoryId: sale.categoryDetails.categoryId,
          createdAt: sale.createdAt,
          batchNumber: sale.productDetails.batchNumber,
          category: sale.productDetails.productType,
        }));
      };

      const transformedSales = transformSales(paginatedSales);

      const totalSales = fullfilledSales.reduce(
        (acc, sale) => acc + sale.soldprice,
        0
      );
      const totalCommission = fullfilledSales.reduce(
        (acc, sale) => acc + sale.commission,
        0
      );
      const totalProfit = filteredSales.reduce(
        (acc, sale) => acc + sale.totalprofit,
        0
      );
      const financeSales = fullfilledSales
        .filter(
          (sale) =>
            sale.saleType === "finance" &&
            sale.financeDetails.financeStatus === "pending"
        )
        .reduce((acc, sale) => acc + sale.financeDetails.financeAmount, 0);

      return {
        sales: {
          sales: transformedSales,
          totalSales,
          totalProfit,
          totalCommission,
          financeSales,
          totalPages: Math.ceil(fullfilledSales.length / limit),
          currentPage: page,
        },
        analytics: {
          analytics: await this.analyseSalesMetric(fullfilledSales),
        },
      };
    } catch (err) {
      console.error("Error generating category sales:", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Internal error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Internal server error"
      );
    }
    // Rest of the logic remains the same...
  }

  async analyseSalesMetric(salesData) {
    try {
      const productMetric = {};
      const sellerMetric = {};

      // Iterate through the sales data
      salesData.forEach((sale) => {
        const {
          soldprice,
          totalprofit,
          totaltransaction,
          productDetails,
          categoryDetails,
          sellerDetails,
        } = sale;
        //did some twisting so we can have transcation counted in terms of category
        const productId = categoryDetails.itemName;
        const sellerId = sellerDetails.id;
        const productName = categoryDetails.itemName;
        const sellerName = sellerDetails.name;

        // Update product metrics
        if (!productMetric[productId]) {
          productMetric[productId] = {
            productName: productName,
            totalSales: 0,
            totaltransacted: 0,
            netprofit: 0,
          };
        }

        productMetric[productId].totalSales += soldprice;
        productMetric[productId].totaltransacted += totaltransaction;
        productMetric[productId].netprofit += totalprofit;

        if (!sellerMetric[sellerId]) {
          sellerMetric[sellerId] = {
            sellerName: sellerName,
            totalSales: 0,
            netprofit: 0,
            totaltransacted: 0,
          };
        }

        sellerMetric[sellerId].totalSales += soldprice;
        sellerMetric[sellerId].netprofit += totalprofit;
        sellerMetric[sellerId].totaltransacted += totaltransaction;
      });

      // Sort and get top 5 products
      const productAnalytics = Object.values(productMetric)
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

      // Get total number of products
      const totalProducts = Object.keys(productMetric).length;

      // Sort and get top 5 sellers
      const sellerAnalytics = Object.values(sellerMetric)
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

      // Get total number of sellers
      const totalSellers = Object.keys(sellerMetric).length;

      return { sellerAnalytics, productAnalytics, totalProducts, totalSellers };
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

  async getUserSales(salesDetails) {
    try {
      const { userId, startDate, endDate, page, limit } = salesDetails;
      const skip = (page - 1) * limit;

      // Fetch general sales data
      const generalSalesData = await this.generategeneralsales({
        startDate,
        endDate,
        page,
        limit,
      });

      const allSales = generalSalesData[0].sales.sales;

      // Filter sales for the specific user
      const fullfilledSales = allSales.filter(
        (sale) => sale.sellerDetails.id === userId
      );

      // Filter out pending finance sales
      const filteredSales = fullfilledSales.filter((sale) => {
        return (
          sale.saleType !== "finance" ||
          sale.financeDetails.financeStatus !== "pending"
        );
      });

      // Paginate the sales
      const paginatedSales = fullfilledSales.slice(skip, skip + limit);

      // Transform sales data to match the previous structure
      const transformSales = (sales) => {
        return sales.map((sale) => ({
          soldprice: sale.soldprice,
          netprofit: sale.totalprofit,
          commission: sale.commission,
          productcost: sale.productDetails.productCost,
          productmodel: sale.categoryDetails.itemModel,
          productname: sale.categoryDetails.itemName,
          totalnetprice: sale.soldprice,
          totalsoldunits: sale.totaltransaction,
          totaltransaction: sale.totaltransaction,
          _id: {
            productId: sale.productDetails.productID,
            sellerId: sale.sellerDetails.id,
            shopId: sale.shopDetails.id,
          },
          financeDetails: sale.financeDetails,
          CategoryId: sale.categoryDetails.categoryId,
          createdAt: sale.createdAt,
          batchNumber: sale.productDetails.batchNumber,
          category: sale.productDetails.productType,
        }));
      };

      const transformedSales = transformSales(paginatedSales);

      // Calculate totals
      const totalSales = fullfilledSales.reduce(
        (acc, sale) => acc + sale.soldprice,
        0
      );
      const totalCommission = fullfilledSales.reduce(
        (acc, sale) => acc + sale.commission,
        0
      );
      const totalProfit = filteredSales.reduce(
        (acc, sale) => acc + sale.totalprofit,
        0
      );
      const financeSales = fullfilledSales
        .filter(
          (sale) =>
            sale.saleType === "finance" &&
            sale.financeDetails.financeStatus === "pending"
        )
        .reduce((acc, sale) => acc + sale.financeDetails.financeAmount, 0);


      return {
        sales: {
          sales: transformedSales,
          totalSales,
          totalProfit,
          totalCommission,
          financeSales,
          totalPages: Math.ceil(filteredSales.length / limit),
          currentPage: page,
        },
        analytics: {
          analytics: await this.analyseSalesMetric(fullfilledSales),
        },
      };
    } catch (error) {
      console.error("Error in getUserSales:", error);
      throw new APIError(
        "Failed to fetch sales data",
        STATUS_CODE.INTERNAL_ERROR,
        error.message
      );
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
