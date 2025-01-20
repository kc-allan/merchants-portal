import mongoose from "mongoose";

const { Schema } = mongoose;

const salesSchema = new Schema({
    CategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
    },
    itemType: {
        type: String,
        enum: ['mobiles', 'accessories'],
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'itemType',
        required: true
    },
    soldUnits: {
        type: Number,
        required: true,
    },
    client: {
        type: String,
        required: true,
        default: "captech"
    },
    soldprice: {
        type: Number,
        required: true
    },
    profit: {
        type: Number,
        required: true
    },
    commission: {
        type: Number,
        required: true
    },
    commissionStatus: {
        type: "String",
        default: "pending",
        enum: ["pending", "paid", "still awaiting"]
    },
    discount: {
        type: Number,
        default: 0
    },
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: "actors",
        required: true,
    },
    shopId: {
        type: Schema.Types.ObjectId,
        ref: "shops",
        required: true
    },
    saleType: {
        type: String,
        enum: ["finance", "direct"],
        default: "direct"
    },
    financeDetails: {
        financer: { type: String, default: "captech" },
        financeAmount: { type: Number, default: 0 },
        financeStatus: { type: String, enum: ["pending", "paid"], default: "paid" },
        dueDate: Date
    },
    customerName: {
        type: String,
        default: "Doe"
    },
    customerEmail: {
        type: String,
        default: "Doe@gmail.com"
    },
    customerphonenummber: {
        type: String,
        default: "0700000000"
    },
    paymentmethod: {
        type: String,
        enum: ['cash', 'credit_card', 'debit_card', 'online_payment']
    },
    shopLocation: {
        type: String
    }
}, { timestamps: true });

const salesDatabase = mongoose.model("sales", salesSchema);

export { salesDatabase };
