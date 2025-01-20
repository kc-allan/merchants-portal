import mongoose from "mongoose";

const { Schema } = mongoose;

const newaccessory = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "products",
    },
    productID: {
      type: Schema.Types.ObjectId,
      ref: "accessories",
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "distribution",
    },
    productStatus: {
      type: String,
      default: "pending",
    },
    confirmedBy: {
      type: String,
      default: null,
    },
    transferId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const newPhoneItem = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "products",
    },

    productID: {
      type: Schema.Types.ObjectId,
      ref: "mobiles",
    },
    quantity: {
      type: Number,
      required: true,
    },
    productIMEI: {
      type: String,
    },
    status: {
      type: String,
      default: "distribution",
    },
    productStatus: {
      type: String,
      default: "pending",
    },
    confirmedBy: {
      type: String,
      default: null,
    },
    transferId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ShopSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sellers: [
      {
        type: Schema.Types.ObjectId,
        ref: "actors",
      },
    ],
    address: {
      type: String,
      required: true,
    },
    distributedStocks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Distribution",
      },
    ],
    newAccessory: [newaccessory],
    newPhoneItem: [newPhoneItem],
    stockItems: [
      {
        stock: {
          type: Schema.Types.ObjectId,
          ref: "accessories",
        },
        categoryId: {
          type: Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
          default: 0,
        },
      },
    ],

    phoneItems: [
      {
        stock: {
          type: Schema.Types.ObjectId,
          ref: "mobiles",
        },
        categoryId: {
          type: Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

ShopSchema.index({ name: "text", address: "text" });

const Shop = mongoose.model("shops", ShopSchema);

export { Shop };
