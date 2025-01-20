import { parse } from "dotenv";
import { salesmanagment } from "../../services/sales-services.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
import moment from "moment";
import { generatePdfMakeReport, generatePdfSalesReport } from "../../services/pdfGenerator.js"

const salesService = new salesmanagment();

const makesales = async (req, res) => {
    try {
        const { bulksales, customerdetails, shopName } = req.body;
        const user = req.user;
        const shopname = req.params.name;

        // Created a helper  function to process depending on product category
        const processSales = (sales, salesMethod) => {
            //flatMap() will hadle multiple itemId and ensure each 
            //id is procesed as a separate sales
            return sales.flatMap(sale => {
                const { items, ...salesDetail } = sale
                return items.map((item) => {
                    const salesDetails = {
                        ...salesDetail,
                        soldprice: item.soldprice,
                        soldUnits: item.soldUnits,
                        productId: item.productId,
                        shopname: shopName,
                        sellerId: user.id,
                        customerName: customerdetails.name,
                        customerEmail: customerdetails.email,
                        customerphonenumber: customerdetails.phonenumber
                    };
                    // the call method will create 
                    //hope the new developer you are familiar with context binding in js
                    // if not you can check it out
                    //i know but its long but i really want you to understand
                    //the call ensure that this inside the salesMehod refers to the sales service
                    return salesMethod.call(salesService, salesDetails);
                })

            });
        };

        // Process phone sales
        const phonesales = bulksales.filter(sales => sales.itemType === "mobiles");
        const processphonesales = phonesales.length > 0 ? processSales(phonesales, salesService.MobileSales) : [];

        // Process accessory sales
        const accessoriesSales = bulksales.filter(sales => sales.itemType == "accessories");
        const processaccessoriesales = accessoriesSales.length > 0 ? processSales(accessoriesSales, salesService.Accessorysales) : [];

        // Use promises to wait for all sales to be processed
        const allPromises = [...processphonesales, ...processaccessoriesales];
        if (allPromises.length > 0) {
            const results = await Promise.allSettled(allPromises);

            const successfulSales = results.filter((result) => result.status === "fulfilled");
            const failedSales = results.filter((result) => result.status === "rejected");

            if (failedSales.length > 0) {
                console.error("Some distributions failed:", failedSales);
            }
            return res.status(200).json({
                message: "sales process completed",
                successfulSales: successfulSales.length,
                failedSales: failedSales.length,
                error: failedSales.length > 0,
                details: failedSales.map((failure) => ({
                    reason: failure.reason.message || "Unknown error",
                })),
            });
        } else {
            throw new APIError("No distribution made", STATUS_CODE.BAD_REQUEST, "No sales made");
        }

    } catch (err) {
        console.log("err", err);
        if (err instanceof APIError) {
            res.status(err.statusCode).json({
                error: err.message,
            });
        } else {
            res.status(STATUS_CODE.INTERNAL_ERROR).json({
                error: "Internal Server Error",
            });
        }
    }
};

const getgeneralsales = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const period = req.query.period || "year";
        let startDate;
        let endDate;
        const user = req.user;
        if (user.role !== "manager" && user.role !== "superUser") {
            throw new APIError(
                "not authorised",
                403,
                "not allowed to view sales"

            )
        }
        const getStartdate = (date) => {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            return start;
        };

        const getEndDate = (date) => {
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            return end;
        };
        if (req.query.date) {
            const date = req.query.date;
            startDate = date ? getStartdate(date) : getStartdate(new Date());
            endDate = date ? getEndDate(date) : getEndDate(new Date());
        } else {
            const now = moment();
            switch (period) {
                case "week":
                    startDate = now.startOf("week").toDate();
                    endDate = now.endOf("week").toDate();
                    break;
                case "month":
                    startDate = now.startOf("month").toDate();
                    endDate = now.endOf("month").toDate();
                    break;
                case "year":
                    startDate = now.startOf("year").toDate();
                    endDate = now.endOf("year").toDate();
                    break;
                default:
                    startDate = now.startOf("day").toDate();
                    endDate = now.endOf("day").toDate();
            }
        }
        const generalSales = await salesService.generategeneralsales({
            startDate,
            endDate,
            limit,
            page,
        });


        res.status(200).json({
            success: true,
            message: "General sales data retrieved successfully",
            data: {
                analytics: generalSales.analytics,
                sales: generalSales.sales,
                salesPerMonth: generalSales.salesPerMonth,
                totalSales: generalSales.totalSales,
                totalProfit: generalSales.totalProfit,
                totalfinanceSalesPending: generalSales.financeSales,
                totalPages: generalSales.totalPages,
                currentPage: generalSales.currentPage,
            },
        });
    } catch (err) {
        if (err instanceof APIError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
};
const downloadGeneralSales = async (req, res) => {
    try {
        const { date, page = 1, limit = 10 } = req.query;
        const period = req.query.period || "year";

        const getStartOfDay = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
        const getEndOfDay = (date) => new Date(new Date(date).setHours(23, 59, 59, 999));

        let startDate, endDate;
        if (date) {
            startDate = getStartOfDay(date);
            endDate = getEndOfDay(date);
        } else {
            const now = moment();
            switch (period) {
                case "week":
                    startDate = now.startOf("week").toDate();
                    endDate = now.endOf("week").toDate();
                    break;
                case "month":
                    startDate = now.startOf("month").toDate();
                    endDate = now.endOf("month").toDate();
                    break;
                case "year":
                    startDate = now.startOf("year").toDate();
                    endDate = now.endOf("year").toDate();
                    break;
                default:
                    startDate = now.startOf("day").toDate();
                    endDate = now.endOf("day").toDate();
            }
        }
        const generalSales = await salesService.generategeneralsales({
            startDate,
            endDate,
            limit,
            page,
        });
        console.log("sales")
        // res.status(200).json({ message: sales })
        const salesDetails = {
            ...generalSales,
            startDate: startDate,
            endDate: endDate
        }
        const pdfBuffer = await generatePdfSalesReport(salesDetails);
        console.log("PDF Buffer Type:", typeof pdfBuffer);
        console.log("PDF Buffer Length:", pdfBuffer.length);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="finance_report.pdf"');
        res.end(pdfBuffer);
    } catch (err) {
        console.log("ererer", err)
        if (err instanceof APIError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
const downloadSalePdf = async (req, res) => {
    try {
        const { date, page = 1, limit = 10 } = req.query;
        const period = req.query.period || "year";
        const financer = req.params.name;
        console.log("controller", financer);

        const getStartOfDay = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
        const getEndOfDay = (date) => new Date(new Date(date).setHours(23, 59, 59, 999));

        let startDate, endDate;
        if (date) {
            startDate = getStartOfDay(date);
            endDate = getEndOfDay(date);
        } else {
            const now = moment();
            switch (period) {
                case "week":
                    startDate = now.startOf("week").toDate();
                    endDate = now.endOf("week").toDate();
                    break;
                case "month":
                    startDate = now.startOf("month").toDate();
                    endDate = now.endOf("month").toDate();
                    break;
                case "year":
                    startDate = now.startOf("year").toDate();
                    endDate = now.endOf("year").toDate();
                    break;
                default:
                    startDate = now.startOf("day").toDate();
                    endDate = now.endOf("day").toDate();
            }
        }

        const salesDetails = { startDate, endDate, financer, page, limit };
        const salesInfo = await salesService.getSalesDownloads(salesDetails);
        console.log("sales", salesInfo)
        // res.status(200).json({ message: sales })
        const pdfBuffer = await generatePdfMakeReport(salesInfo);
        console.log("PDF Buffer Type:", typeof pdfBuffer);
        console.log("PDF Buffer Length:", pdfBuffer.length);
        // Send the PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="finance_report.pdf"');
        res.end(pdfBuffer);
    } catch (err) {
        console.log(err)
        if (err instanceof APIError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
};

const getCategorySales = async (req, res) => {
    try {
        const { date, page = 1, limit = 10 } = req.query;
        const period = req.query.period || "year"
        const { categoryId } = req.params;
        const user = req.user;
        if (user.role !== "manager" && user.role !== "superUser") {
            throw new APIError(
                "not authorised",
                403,
                "not allowed to view sales"

            )
        }

        // Helper functions for date ranges
        const getStartOfDay = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
        const getEndOfDay = (date) => new Date(new Date(date).setHours(23, 59, 59, 999));

        let startDate, endDate;

        if (date) {
            startDate = getStartOfDay(date);
            endDate = getEndOfDay(date);
        } else {
            const now = moment();
            switch (period) {
                case "week":
                    startDate = now.startOf("week").toDate();
                    endDate = now.endOf("week").toDate();
                    break;
                case "month":
                    startDate = now.startOf("month").toDate();
                    endDate = now.endOf("month").toDate();
                    break;
                case "year":
                    startDate = now.startOf("year").toDate();
                    endDate = now.endOf("year").toDate();
                    break;
                default:
                    startDate = now.startOf("day").toDate();
                    endDate = now.endOf("day").toDate();
            }
        }
        const salesDetails = {
            categoryId,
            startDate,
            endDate,
            page: parseInt(page),
            limit: parseInt(limit),
        }

        const report = await salesService.generateCategorySales(salesDetails);

        if (!report.salesReport || report.salesReport.length === 0) {
            return res.status(404).json({ message: "No sales found for the given category." });
        }

        res.status(200).json(report);
    } catch (err) {
        console.error(err);

        if (err instanceof APIError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
};


const getShopSales = async (req, res) => {
    try {
        let startdate;
        let endDate;
        const user = req.user;
        if (user.role !== "manager" && user.role !== "superUser") {
            throw new APIError(
                "not authorised",
                403,
                "not allowed to view sales"

            )
        }
        const getStartDate = (date) => {
            let start = new Date(date)
            start.setHours(0, 0, 0, 0)
            return start
        }

        const endofDay = (date) => {
            let end = new Date(date);
            end.setHours(23, 59, 59, 999)
            return end
        }
        const period = req.query.period || 'year'
        if (req.query.date) {
            const date = req.query.date;
            startdate = date ? getStartDate(date) : getStartDate(new Date());
            endDate = date ? endofDay(date) : endofDay(new Date())
        } else {
            const now = moment()

            switch (period) {
                case 'week':
                    startdate = now.startOf('week').toDate();
                    endDate = now.endOf('week').toDate()
                    break;
                case "month":
                    startdate = now.startOf('month').toDate();
                    endDate = now.endOf('month').toDate()
                    break;
                case "year":
                    startdate = now.startOf("year").toDate();
                    endDate = now.endOf('year').toDate();
                    break;
                default:
                    startdate = now.startOf("day").toDate();
                    endDate = now.endOf("day").toDate()
            }

        }
        const shopname = req.params.shopname;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const report = await salesService.generateShopSales({ shopname: shopname, startDate: startdate, endDate: endDate, page, limit });
        if (!report.sales || report.sales.length === 0) {
            res.status(404).json({ message: "Shop sales not found" });
            return;
        }
        res.status(200).json({ message: report });
    }
    catch (err) {
        if (err instanceof APIError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }

}

const getUserSales = async (req, res) => {
    try {
        let startDate;
        let endDate;
        const user = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        console.log("#@#", user)
        const { userId } = req.params;
        if (user.id !== userId && user.role !== "manager" && user.role !== "superUser") {
            throw new APIError(
                "not authorised",
                403,
                "not allowed to view sales"
            )
        }
        const getStartDate = (date) => {
            let start = new Date(date)
            start.setHours(0, 0, 0, 0)
            return start
        }

        const endofDay = (date) => {
            let end = new Date(date);
            end.setHours(23, 59, 59, 999)
            return end
        }
        const period = req.query.period || 'year'
        if (req.query.date) {
            const date = req.query.date;
            startDate = date ? getStartDate(date) : getStartDate(new Date());
            endDate = date ? endofDay(date) : endofDay(new Date())
        } else {
            const now = moment()

            switch (period) {
                case 'week':
                    startDate = now.startOf('week').toDate();
                    endDate = now.endOf('week').toDate()
                    break;
                case "month":
                    startDate = now.startOf('month').toDate();
                    endDate = now.endOf('month').toDate()
                    break;
                case "year":
                    startDate = now.startOf("year").toDate();
                    endDate = now.endOf('year').toDate();
                    break;
                default:
                    startDate = now.startOf("day").toDate();
                    endDate = now.endOf("day").toDate()
            }

        }
        const usersales = await salesService.getUserSales(userId, startDate, endDate, page, limit);
        return res.status(200).json(usersales);
    } catch (err) {
        if (err instanceof APIError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
};
const payUsercommission = async (req, res) => {
    const { salesId, amount } = req.body;
    try {
        // const user = req.user;
        // if (user.role !== "manager") {
        //     throw new APIError("unauthorised", STATUS_CODE.UNAUTHORIZED, "not allowed to pay commission")
        // }
        const paycommission = await salesService.paymentofcommission(salesId, amount)
        return res.status(200).json({ error: false, message: "successfully paid the commission" })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "failed to pay commission" });
    }
}

const sendEmails = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const period = req.query.period
        let startdate;
        let endDate;

        const getStartdate = (date) => {
            let start = new Date(date)
            start.setHours(0, 0, 0, 0)
            return start
        }

        const getendDate = (date) => {
            let end = new Date(date)
            end.setHours(23, 59, 59, 999)
            return end
        }

        if (req.query.date) {
            startdate = date ? getStartdate(date) : getStartdate(new Date());
            endDate = date ? getendDate(date) : getendDate(new Date())
        }
        const generalSales = await salesService.generategeneralsales({ startdate: startdate, endDate: endDate, limit: limit, page: page })

        res.status(200).json({ message: generalSales })
    }
    catch (err) {
        console.log("controller", err)
        if (err instanceof APIError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

export { getCategorySales, getShopSales, getgeneralsales, getUserSales, payUsercommission, makesales, downloadSalePdf, downloadGeneralSales };
