import mongoose from "mongoose";
const { Schema } = mongoose;

const disributionSchema = new Schema({
  stock: {
    type: Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },
  toShop: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  distibutiondate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Distribution = mongoose.model("Distibution", disributionSchema);
export { Distribution };
