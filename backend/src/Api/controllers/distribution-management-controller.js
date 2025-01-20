import { distributionService } from "../../services/distribution-contoller-service.js"
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
const distributionManager = new distributionService();

const handleBulkDistibution = async (req, res) => {
    try {
        const user = req.user;
        const { bulkDistribution, shopDetails, category } = req.body

        console.log(req.body)
        if (user.role !== "manager" && user.role !== "superuser") {
            throw new APIError(
                "unauthorised",
                STATUS_CODE.UNAUTHORIZED,
                "not allowed to commmit a distribution"
            )
        }

        if (!bulkDistribution || bulkDistribution.length === 0) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                message: "Please provide a list of items"
            })
        }

        const mainShop = shopDetails.mainShop;
        const distributedShop = shopDetails.distributedShop;
        const userName = user.name;
        const processDistribution = (distributions, distributionMethod) => {
            return distributions.map((distribution) => {
                const distributionData = {
                    ...distribution,
                    mainShop: mainShop,
                    distributedShop: distributedShop,
                    userName: userName
                }
                return distributionMethod.call(distributionManager, distributionData)
            })
        }
        let productDistribution;
        let processProductDistribution;
        if (category === "mobiles") {
            productDistribution = bulkDistribution.filter(item => item.stockId !== null);
            console.log("wewe", productDistribution)
            processProductDistribution = productDistribution.length > 0 ? processDistribution(productDistribution, distributionManager.createnewMobileDistribution) : [];
        } else {
            productDistribution = bulkDistribution.filter(item => item.stockId !== null);
            console.log("wwe", productDistribution)
            processProductDistribution = productDistribution.length > 0 ? processDistribution(productDistribution, distributionManager.createnewAccessoryDistribution) : [];
        }
        const allPromises = [...processProductDistribution];

        if (allPromises.length > 0) {
            const results = await Promise.allSettled(allPromises);

            const successfulDistributions = results.filter((result) => result.status === "fulfilled");
            const failedDistributions = results.filter((result) => result.status === "rejected");

            if (failedDistributions.length > 0) {
                console.error("Some distributions failed:", failedDistributions);
            }

            return res.status(200).json({
                message: "Distribution process completed",
                successfulDistributions: successfulDistributions.length,
                failedDistributions: failedDistributions.length,
                error: failedDistributions.length > 0,
                details: failedDistributions.map((failure) => ({
                    reason: failure.reason.message || "Unknown error",
                })),
            });
        } else {
            throw new APIError("No distribution made", STATUS_CODE.BAD_REQUEST, "No distribution made");
        }

    }
    catch (err) {
        if (err instanceof APIError) {
            res.status(err.statusCode).json({ error: true, message: err.message })
        }
        res.status(err.statusCode).json({ error: true, message: err.message })
    }

}

export { handleBulkDistibution }