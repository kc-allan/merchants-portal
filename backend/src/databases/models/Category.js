import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema(
    {
        itemName: { type: String, required: true, unique: true },
        itemModel: {
            type: String,
            unique: true,
            required: true,
            sparse: true,
        },
        brand: { type: String, required: true },
        category: { type: String, required: true },
        minPrice: { type: Number, required: true },
        maxPrice: { type: Number, required: true },
        itemType: { type: String, required: true, enum: ["mobiles", "accessories"] },
        Items: [{ type: Schema.Types.ObjectId, refPath: "itemType" }],
    },
    { timestamps: true }
);
productSchema.index({ itemName: "text", itemModel: "text", brand: "text", category: "text" })
const Product = mongoose.model("products", productSchema);
export { Product };
