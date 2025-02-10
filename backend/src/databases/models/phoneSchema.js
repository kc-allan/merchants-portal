import mongoose from "mongoose";
const { Schema } = mongoose;

const historySchema = new Schema({
  quantity: Number,
  price: Number,
  shopId: { type: Schema.Types.ObjectId, ref: "shops" },
  seller: { type: String, default: null },
  addedBy: { type: String, default: "main admin" },
  date: { type: Date, default: Date.now },
  type: String,
});

const tranferhistorySchema = new Schema({
  quantity: Number,
  date: { type: Date, default: Date.now },
  fromShop: String,
  toShop: String,
  transferdBy: { type: String, default: "main admin" },
  status: String,
  confirmedBy: { type: String, default: null },
  type: String,
});
const phoneSchema = new Schema(
  {
    CategoryId: { type: Schema.Types.ObjectId, ref: "products" },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "actors",
      default: null,
    },
    serialNumber: {
      type: String,
      default: "0",
    },
    batchNumber: {
      type: String,
      default: 0,
    },
    productType: {
      type: String,
    },
    faultyItems: {
      type: Number,
      default: 0,
    },
    supplierName: {
      type: String,
      default: "supplier",
    },
    financeDetails: {
      financer: { type: String, default: "Captech" },
      financeAmount: { type: String, default: 0 },
      financeStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
      dueDate: { type: Date, default: Date.now }
    },
    IMEI: {
      type: String,
      unique: true,
      required: true,
    },
    stockStatus: {
      type: "String",
      default: "Available",
      required: true,
    },
    availableStock: {
      type: Number,
      default: 1,
      required: true,
    },
    productcost: {
      type: Number,
      default: 0,
      required: true,
    },
    commission: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    barcodepath: {
      type: String,
    },
    history: [historySchema],
    transferHistory: [tranferhistorySchema],
  },
  {
    timestamps: true,
  }
);

const Mobile = mongoose.model("mobiles", phoneSchema);

export { Mobile };
