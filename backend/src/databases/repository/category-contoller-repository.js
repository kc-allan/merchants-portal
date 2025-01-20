import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
import { Product } from '../models/Category.js';
class CategoryManagementRepository {
    async AddNewProduct(itemDetails) {
        try {
            const { itemName, itemModel, itemType, brand, minPrice, maxPrice, category } = itemDetails;

            // Log for debugging
            console.log("itemName", itemName);

            // Create the new product
            const productItem = new Product({
                itemName,
                itemModel,
                itemType,
                brand,
                minPrice,
                maxPrice,
                category,
            });

            // Save the product to the database
            const savedProduct = await productItem.save();
            console.log("saved", savedProduct)
            return savedProduct;
        } catch (err) {
            if (err.code === 11000) {
                throw new APIError(
                    "Duplicate Key Error",
                    STATUS_CODE.BAD_REQUEST,
                    "product already exists"
                );
            } else {
                throw new APIError(
                    "API Error",
                    STATUS_CODE.INTERNAL_ERROR,
                    err.message || "Unable to create new goods"
                );
            }
        }
    }
    async updateCategory(categoryId, updatedDetails) {
        try {
            const updatedCategory = await Product.findByIdAndUpdate(categoryId, { $set: updatedDetails }, { new: true });
            if (!updatedCategory) {
                throw new APIError(
                    "Not Found",
                    STATUS_CODE.NOT_FOUND,
                    "category not found"
                );
            }
            return updatedCategory;
        } catch (err) {
            throw new APIError(
                "Service Error",
                STATUS_CODE.INTERNAL_ERROR,
                "internal server error"
            );
        }

    }
    async AddItemInProduct({ id, itemId }) {
        try {
            const UpdatedProduct = await Product.findByIdAndUpdate(
                id,
                {
                    $push: { Items: itemId },
                },
                { new: true }
            );
            console.log("i have been approached")
        }
        catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODE.INTERNAL_ERROR,
                err.message || "Unable to create new goods"
            );
        }
    }
    async updateSalesOfProduct({ id, salesId }) {
        try {
            const updatedProduct
                = await Product.findByIdAndUpdate(
                    id,
                    {
                        $push: { sales: salesId },
                    },
                    { new: true }
                );
            return updatedProduct;
        } catch (err) {
            throw new APIError(
                "service error",
                STATUS_CODE.INTERNAL_ERROR,
                err.message || "Unable to update sales"
            );
        }
    }
    //fetch all categories id
    async getAllCategories() {
        try {
            const allCategories = await Product.find().populate({
                path: "Items",
                select: "discount commision availableStock createdAt batchNumber stockStatus faultyItems color",
            });
            if (!allCategories) {
                throw new APIError(
                    "Not Found",
                    STATUS_CODE.NOT_FOUND,
                    "No categories found"
                );
            }
            return allCategories;
        } catch (err) {
            throw new APIError(
                "Service Error",
                STATUS_CODE.INTERNAL_ERROR,
                "internal server error"
            );
        }
    }

    async getCategoryById(categoryId) {
        try {
            const category = await Product
                .findById(categoryId)
                .populate({
                    path: "Items",
                    select: "discount commision availableStock updatedAt createdAt batchNumber stockStatus faultyItems color IMEI transferHistory.confirmedBy",
                })
            console.log("category", category)
            if (!category) {
                throw new APIError(
                    "Not Found",
                    STATUS_CODE.NOT_FOUND,
                    "category not found"
                );
            }
            return category;
        } catch (err) {
            if (err instanceof APIError) {
                throw err;
            }
            throw new APIError(
                "Service Error",
                STATUS_CODE.INTERNAL_ERROR,
                "internal server error"
            );
        }
    }
}

export { CategoryManagementRepository }