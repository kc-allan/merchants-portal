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
            const allCategories = await this.repository.getAllMobilesCategory();
            const individualCategory = allCategories.map((itemStock) => {
                if (itemStock.mobiles.length > 0) {
                    return {
                        id: itemStock.id,
                        itemName: itemStock.itemName,
                        itemModel: itemStock.itemModel,
                        minPrice: itemStock.minPrice,
                        maxPrice: itemStock.maxPrice,
                        brand: itemStock.brand,
                        availableStock: itemStock.mobiles.length,
                        Items: itemStock.mobiles
                    }
                } else {
                    return {
                        id: itemStock.id,
                        itemName: itemStock.itemName,
                        itemModel: itemStock.itemModel,
                        minPrice: itemStock.minPrice,
                        maxPrice: itemStock.maxPrice,
                        brand: itemStock.brand,
                        availableStock: itemStock.accessories.length,
                        Items: itemStock.accessories
                    }
                }
            })
            console.log("$$$$$$", individualCategory);
            return individualCategory;
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
            const id = parseInt(categoryId, 10);
            const category = await this.repository.getCategoryById(id);
            const item = category.mobiles.length > 0 ? category.mobiles : category.accessories;
            // console.log("item", item);  /
            const newCategory = {
                id: category.id,
                itemName: category.itemName,
                itemType: category.itemType,
                itemModel: category.itemModel,
                brand: category.brand,
                minPrice: category.minPrice,
                maxPrice: category.maxPrice,
                Items: item
            }

            console.log("Items", newCategory);

            // console.log(category);
            return newCategory;
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
    async getCategoryByShop(shopName, categoryId) {
        try {
            const id = parseInt(categoryId, 10);
            const category = await this.repository.getCategoryByShop(id, shopName);
            const item = category.mobiles.length > 0 ? category.mobiles : category.accessories;
            // console.log("item", item);  /
            const newCategory = {
                id: category.id,
                itemName: category.itemName,
                itemType: category.itemType,
                itemModel: category.itemModel,
                brand: category.brand,
                minPrice: category.minPrice,
                maxPrice: category.maxPrice,
                Items: item
            }

            //console.log("Items", newCategory);

            // console.log(category);
            return newCategory;
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