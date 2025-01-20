import { CategoryManagementService } from '../../services/category-contoller-service.js';

const category = new CategoryManagementService();

import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
const createCategory = async (req, res) => {
    try {

        const user = req.user;
        console.log(user);
        if (user.role !== "superuser" && user.role !== "manager") {
            throw new APIError(
                "not authorised",
                STATUS_CODE.UNAUTHORIZED,
                "not allowed to create a pre"
            )
        }
        const createdProduct = await category.createProduct(req.body)
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

const getAllCategories = async (req, res) => {
    try {
        const user = req.user;
        console.log(user);
        if (user.role !== "superuser" && user.role !== "manager") {
            throw new APIError(
                "not authorised",
                STATUS_CODE.UNAUTHORIZED,
                "not allowed to get all categories"
            )
        }
        const allProducts = await category.getAllCategories()
        res.status(200).json({
            message: "all categories retrieved successfully",
            data: allProducts
        })
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
}

const updateCategory = async (req, res) => {
    try {
        const user = req.user;
        console.log(user);
        if (user.role !== "superuser" && user.role !== "manager") {
            throw new APIError(
                "not authorised",
                STATUS_CODE.UNAUTHORIZED,
                "not allowed to update a category"
            )
        }
        const updatedProduct = await category.updateCategory(req.params.id, req.body)
        res.status(200).json({
            message: "product succuessfully updated",
            data: updatedProduct
        })
    } catch (err) {
        console.log("@@", err)
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
const getCategoryById = async (req, res) => {
    try {
        const user = req.user;
        console.log(user);
        // if (user.role !== "superuser" && user.role !== "manager") {
        //     throw new APIError(
        //         "not authorised",
        //         STATUS_CODE.UNAUTHORIZED,
        //         "not allowed to view a category"
        //     )
        // }
        const categoryData = await category.getCategoryById(req.params.id)
        res.status(200).json({
            message: "category fetched successfully",
            data: categoryData
        })
    } catch (err) {
        console.log("@@", err)
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

export {
    createCategory,
    updateCategory,
    getCategoryById,
    getAllCategories
}
