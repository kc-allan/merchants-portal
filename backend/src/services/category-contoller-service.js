import { CategoryManagementRepository } from '../databases/repository/category-contoller-repository.js';
import { APIError, STATUS_CODE } from "../Utils/app-error.js";
class CategoryManagementService {
    constructor() {
        this.repository = new CategoryManagementRepository();
    }
    async createProduct(itemDetails) {
        try {
            //verify item needed
            const verifiedItem = [
                "itemName",
                "itemModel",
                "itemType",
                "brand",
                "minPrice",
                "maxPrice",
                "category",
            ]
            const verifiedProperties = Object.keys(itemDetails).filter((key) =>
                verifiedItem.includes(key)
            )
            if (!verifiedProperties) {
                throw new APIError("not found", STATUS_CODE.BAD_REQUEST, "not item found");
            }
            const addedProduct = await this.repository.AddNewProduct(itemDetails);
            return addedProduct
        }
        catch (err) {
            if (err instanceof APIError) {
                throw err
            }
            throw new APIError(
                "service error",
                STATUS_CODE.INTERNAL_ERROR,
                "internal server error"
            )
        }
    }

    //fetch all categories available
    async getAllCategories() {
        try {
            const allCategories = await this.repository.getAllCategories();
            return allCategories;
        }
        catch (err) {
            if (err instanceof APIError) {
                throw err
            }
            throw new APIError(
                "service error",
                STATUS_CODE.INTERNAL_ERROR,
                "internal server error"
            )
        }
    }

    async updateCategory(categoryId, updatedDetails) {
        try {
            const updatedCategory = await this.repository.updateCategory(categoryId, updatedDetails);
            return updatedCategory;
        }
        catch (err) {
            if (err instanceof APIError) {
                throw err
            }
            throw new APIError(
                "service error",
                STATUS_CODE.INTERNAL_ERROR,
                "internal server error"
            )
        }
    }

    async getCategoryById(categoryId) {
        try {
            const category = await this.repository.getCategoryById(categoryId);
            return category;
        }
        catch (err) {
            if (err instanceof APIError) {
                throw err
            }
            throw new APIError(
                "service error",
                STATUS_CODE.INTERNAL_ERROR,
                "internal server error"
            )
        }
    }

}

export {
    CategoryManagementService
}