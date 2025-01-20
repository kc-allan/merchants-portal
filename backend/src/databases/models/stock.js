import mongoose from "mongoose";
const { Schema } = mongoose;
const historySchema = new Schema({
  quantity: Number,
  AddedBy: { type: String, default: "main admin" },
  shopName: { type: String, default: "main shop" },
  date: { type: Date, default: Date.now },
  type: String,
});

const transferHistorySchema = new Schema({
  quantity: Number,
  date: { type: Date, default: Date.now },
  fromShop: { type: String, default: "Main shop" },
  toShop: { type: String, default: "distributed Shop" },
  tranferdBy: { type: String, default: null },
  confirmedBy: { type: String, default: null },
  status: String,
  type: String,
});
const stockSchema = new Schema(
  {
    CategoryId: { type: Schema.Types.ObjectId, ref: "products" },
    batchNumber: {
      type: String,
      default: 0,
      required: true,
    },
    serialNumber: {
      type: String,
      default: "0",
    },
    stockStatus: {
      type: String,
      default: "Available"
    },
    availableStock: {
      type: Number,
      default: 0,
      required: true,
    },
    supplierName: {
      type: String,
      default: "supplier"
    },
    faultyItems: {
      type: Number,
      default: 0,
      required: true,
    },
    productcost: {
      type: Number,
      default: 0,
      required: true
    },
    commission: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0
    },
    barcodepath: {
      type: String,
    },
    history: [historySchema],
    transferHistory: [transferHistorySchema],
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

const Stock = mongoose.model("accessories", stockSchema);

export { Stock };
