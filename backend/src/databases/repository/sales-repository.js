import { PrismaClient } from "@prisma/client";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
const prisma = new PrismaClient();
class Sales {
  async createnewMobilesales(salesDetails) {
    try {
      const successfullsale = await prisma.mobilesales.create({
        data: {
          ...salesDetails,
        },
      });
      return successfullsale;
    } catch (err) {
      console.log("creating sales error ", err);
      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async createnewAccessoriesales(salesDetails) {
    try {
      const successfullsale = await prisma.accessoriesales.create({
        data: {
          ...salesDetails,
        },
      });
      return successfullsale;
    } catch (err) {
      console.log("creating sales error ", err);
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
        select: "itemModel itemName,brand",
      });

      if (!sales) {
        throw new APIError(
          "database error".STATUS_CODE.NOT_FOUND,
          "sales not found"
        );
      }
      console.log("@@", sales);
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

  async findSales({ salesTable, startDate, endDate }) {
    try {
      // Determine which Prisma model to use based on sales table

      const salesModel =
        salesTable === "mobilesales"
          ? prisma.mobilesales
          : prisma.accessorysales;

      const results = await salesModel.groupBy({
        by: [
          "productID",
          "shopID",
          "sellerId",
          "createdAt",
          "categoryId",
          "financeStatus",
          "financeAmount",
          "financer",
        ],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },

        _sum: {
          soldPrice: true,
          profit: true,
          commission: true,
        },
        _count: {
          _all: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      //console.log("sales result found", results);
      const withRelations = await Promise.all(
        results.map(async (sale) => {
          const [product, shop, seller, category] = await Promise.all([
            this.getProductDetails(salesTable, sale.productID),
            prisma.shops.findUnique({ where: { id: sale.shopID } }),
            prisma.actors.findUnique({ where: { id: sale.sellerId } }),
            salesTable === "mobilesales"
              ? prisma.categories.findUnique({
                where: { id: sale.categoryId },
              })
              : null,
          ]);

          return {
            ...sale,
            productDetails: product,
            shopDetails: shop,
            sellerDetails: seller,
            categoryDetails: category,
            financeDetails: this.mapFinanceDetails(sale),
          };
        })
      );

      return { generalReport: withRelations };
    } catch (err) {
      console.log("err", err);
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to retrieve sales data"
      );
    }
  }

  async getProductDetails(salesTable, productID) {
    return salesTable === "mobilesales"
      ? prisma.mobiles.findUnique({
        where: { id: productID },
        include: { categories: true },
      })
      : prisma.accessories.findUnique({
        where: { id: productID },
      });
  }
  mapFinanceDetails(sale) {
    return {
      financeStatus: sale.financeStatus || "N/A",
      financeAmount: sale.financeAmount || 0,
      financer: sale.financer || "N/A",
    };
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

}

export { Sales };
