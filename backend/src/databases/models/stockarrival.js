import mongoose from "mongoose";
const { Schema } = mongoose;
const newStockArrival = new Schema(
  {
    category: {
      type: String,
      required: true,
      default: "Mobile",
    },
    itemName: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Mobile",
    },
    itemModel: {
      type: String,
      required: true,
      sparse: true,
    },
    IMEI: {
      type: String,
      unique: true,
      default: 0,
    },
    stockStatus: {
      type: "String",
      default: "Available",
      required: true,
    },
    availableStock: {
      type: Number,
      default: 0,
      required: true,
    },
    arrivalDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const newStock = mongoose.model("newStock", newStockArrival);

export { newStock };
