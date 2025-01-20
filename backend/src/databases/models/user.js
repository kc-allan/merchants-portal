import mongoose from "mongoose";
const { Schema } = mongoose;

const AccessorySalesSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "accessory",
    },
    quantity: {
      type: Number,
      required: true,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    price: {
      type: Number,
      required: true,
    },
    commission: {
      type: "Number",
      default: 0,
    },
  },
  { timestamps: true }
);

const MobileSalesSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "mobiles",
    },
    quantity: {
      type: Number,
      required: true,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "shops",
    },
    price: {
      type: Number,
      required: true,
    },
    commission: {
      type: "Number",
      default: 0,
    },
  },
  { timestamps: true }
);
const assignmentSchema = new Schema(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "shops",
      required: true,
    },
    type: {
      type: String,
      default: "assigned",
    },
    fromDate: {
      type: Date,
      default: Date.now,
    },
    toDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  nextofkinname: {
    type: String,
    default: "null",
  },
  nextofkinphonenumber: {
    type: String,
    default: "null",
  },
  password: {
    type: String,
    required: true,
  },
  workingstatus: {
    type: String,
    required: true,
    default: "inactive",
  },
  assignedShop: {
    type: Schema.Types.ObjectId,
    ref: "shops",
    default: null,
  },
  assignmentHistory: [assignmentSchema],
  AccessorySalesHistory: [AccessorySalesSchema],
  MobilePhoneSalesHistory: [MobileSalesSchema],
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
  Idimagefront: {
    type: String,
    default: "https://www.linkedin.com/default_profile_picture.png",
  },
  Idimagebackward: {
    type: String,
    default: "https://www.linkedin.com/default_profile_picture.png",
  },
  profileimage: {
    type: String,
    default: "https://www.linkedin.com/default_profile_picture.png",
  },
});
userSchema.index({ name: "text", email: "text", phone: "text" });
const User = mongoose.model("actors", userSchema);

export { User };
