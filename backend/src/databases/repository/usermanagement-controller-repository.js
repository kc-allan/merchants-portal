import { User } from "../models/user.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
class usermanagemenRepository {
  async createMainAdmin({
    name,
    email,
    hashedpassword,
    phonenumber,
    nextofkinname,
    nextofkinphonenumber,
    imgUrls,
  }) {
    try {
      const user = new User({
        name: name,
        email: email,
        password: hashedpassword,
        phone: phonenumber,
        nextofkinname: nextofkinname,
        nextofkinphonenumber: nextofkinphonenumber,
        profileimage: imgUrls,
        role: "superuser",
      });
      const newUser = await user.save();
      return newUser;
    } catch (err) {
      if (err.code === 11000) {
        const duplicateField = Object.keys(err.keyValue)[0];
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          `The ${duplicateField} "${err.keyValue[duplicateField]}" is already in use.`
        );
      } else {
        throw new APIError(
          "API error",
          STATUS_CODE.INTERNAL_ERROR,
          "unable to create the super user"
        );
      }
    }
  }

  async createManager({
    name,
    email,
    hashedpassword,
    phonenumber,
    nextofkinname,
    nextofkinphonenumber,
    imgurls,
  }) {
    try {
      const manager = new User({
        name: name,
        email: email,
        password: hashedpassword,
        phone: phonenumber,
        nextofkinname: nextofkinname,
        nextofkinphonenumber: nextofkinphonenumber,
        profileimage: imgUrls,
        role: "manager",
      });
      const newManager = await manager.save();
      return newManager;
    } catch (err) {
      if (err.code === 11000) {

        const duplicateField = err.keyValue ? Object.keys(err.keyValue)[0] : "unknown field";
        const duplicateValue = err.keyValue ? err.keyValue[duplicateField] : "unknown value";
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          `The ${duplicateField} "${duplicateValue}" is already in use.`
        );
      } else {
        throw new APIError(
          "API error",
          STATUS_CODE.INTERNAL_ERROR,
          "unable to create a the manager"
        );
      }
    }
  }
  async createSeller({
    name,
    email,
    hashedpassword,
    phonenumber,
    nextofkinname,
    nextofkinphonenumber,
  }) {
    try {
      const newseller = new User({
        name: name,
        email: email,
        password: hashedpassword,
        nextofkinname: nextofkinname,
        nextofkinphonenumber: nextofkinphonenumber,
        phone: phonenumber,
        role: "seller",
      });
      const seller = await newseller.save();
      return seller;
    } catch (err) {
      console.log("@@@", err)
      if (err.code === 11000) {
        const duplicateField = err.keyValue ? Object.keys(err.keyValue)[0] : "unknown field";
        const duplicateValue = err.keyValue ? err.keyValue[duplicateField] : "unknown value";
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          `The ${duplicateField} "${duplicateValue}" is already in use.`
        );
      } else {
        throw new APIError(
          "API error",
          STATUS_CODE.INTERNAL_ERROR,
          "unable to create a seller due to database error"
        );
      }
    }
  }

  async fetchAllUsers(page, limit) {
    try {
      const skip = (page - 1) * limit;
      const users = await User.find()
        .skip(skip)
        .limit(Number(limit))
        .select({ _id: 1, name: 1, role: 1, email: 1, workingstatus: 1 });
      const totalUsers = await User.countDocuments();
      const totalPages = Math.ceil(totalUsers / limit);

      if (!users) {
        throw new APIError(
          "users not found",
          STATUS_CODE.NOT_FOUND,
          "users are currently not available"
        );
      }
      return { users, totalPages };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async findUser(email) {
    try {
      console.log("email", email);
      const user = await User.findOne(email)
        .populate({ path: "assignedShop", model: "shops", select: "name address" })
        .populate({
          path: "AccessorySalesHistory.shopId",
          model: "shops",
          select: "name",
        })
        .populate({
          path: "MobilePhoneSalesHistory.shopId",
          model: "shops",
          select: "name",
        })
        .populate({
          path: "assignmentHistory.shopId",
          model: "shops",
          select: "name",
        })
        .populate({
          path: "AccessorySalesHistory.productId",
          model: "accessories",
          select: "itemName brand itemModel",
        })
        .populate({
          path: "MobilePhoneSalesHistory.productId",
          model: "mobiles",
          select: "itemName brand itemModel",
        });
      if (!user) {
        throw new APIError(
          "User not found",
          STATUS_CODE.NOT_FOUND,
          "The specified user does not exist"
        );
      }
      return user;
    } catch (err) {
      console.log("err", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async findUserByname({ name }) {
    try {
      const user = await User.findOne({ name: name })
        .select({ _id: 1, assignedShop: 1 })
        .populate({ path: "assignedShop", model: "shops", select: "name" });
      if (!user) {
        throw new APIError(
          "User not found",
          STATUS_CODE.NOT_FOUND,
          "The specified user does not exist"
        );
      }
      return user;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async findUserById({ id }) {
    try {
      const userFound = await User.findById(id)
        .select({ _id: 1, email: 1, assignedShop: 1, workingstatus: 1 })
        .populate({ path: "assignedShop", model: "shops", select: "name" });
      return userFound;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async updateUserProfile({ id, name, email, password, phone }) {
    try {
      const userFound = await this.findUserById({ id });
      if (!userFound) {
        throw new APIError(
          "User not found",
          STATUS_CODE.NOT_FOUND,
          "The specified user does not exist"
        );
      }
      const updateFields = { name, phone, email };
      if (password) {
        updateFields.password = password;
      }

      const updatedUser = await User.findByIdAndUpdate(id, { $set: updateFields }, {
        new: true,
      });
      console.log("updatedUser", updatedUser)
      return updatedUser;
    } catch (err) {
      console.log("err", err);
      throw new APIError(
        "Internal server error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async addprofilepicture({ id, imgUrls }) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { profileimage: imgUrls[0] } },
        { new: true }
      );
      return updatedUser;
    } catch (err) {
      console.log("err", err);
      throw new APIError(
        "DatabasError",
        STATUS_CODE.INTERNAL_ERROR,
        "failed to update user profile picture"
      );
    }
  }
  async addIDpicture({ id, imgUrls }) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { Idimagefront: imgUrls } },
        { new: true }
      );
      return updatedUser;
    } catch (err) {
      console.log("err", err);
      throw new APIError(
        "DatabasError",
        STATUS_CODE.INTERNAL_ERROR,
        "failed to update user profile picture"
      );
    }
  }

  async addIDpicturebackward({ id, imgUrls }) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { Idimagebackward: imgUrls } },
        { new: true }
      );
      return updatedUser;
    } catch (err) {
      console.log("err", err);
      throw new APIError(
        "DatabasError",
        STATUS_CODE.INTERNAL_ERROR,
        "failed to update user profile picture"
      );
    }
  }

  //update user and seller status

  async updateUser({ status, id }) {
    try {
      const UserFound = await this.findUserById({ id })
      if (!UserFound) {
        throw new APIError(
          "User not found",
          STATUS_CODE.NOT_FOUND,
          "The specified user does not exist"
        );
      }
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { workingstatus: status } },
        { new: true }
      );
      return updatedUser;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "DatabasError",
        STATUS_CODE.BAD_REQUEST,
        "failed to update user status"
      );
    }
  }

  async updateUserRole({ role, id }) {
    try {
      const UserFound = await this.findUserById({ id })
      if (!UserFound) {
        throw new APIError(
          "User not found",
          STATUS_CODE.NOT_FOUND,
          "The specified user does not exist"
        );
      }
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { role: role } },
        { new: true }
      );
      console.log("updated", updatedUser);
      return updatedUser;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "DatabasError",
        STATUS_CODE.BAD_REQUEST,
        "failed to update user status"
      );
    }
  }

  //update user sales made

  async updateUserSales({
    email,
    quantity,
    shopId,
    productId,
    price,
    commission,
  }) {
    try {
      const salemadeByUser = await User.findOneAndUpdate(
        { email },
        {
          $push: {
            AccessorySalesHistory: {
              productId: productId,
              quantity: quantity,
              shopId: shopId,
              price: price,
              commission: commission,
            },
          },
        }
      );

      if (!salemadeByUser) {
        throw new APIError(
          "database error",
          STATUS_CODE.INTERNAL_ERROR,
          "error occured when updating seller"
        );
      }

      return salemadeByUser;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }

      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async deleteUser({ id }) {
    try {
      const deletedUser = await userSchema.findByIdAndDelete({ id: id });
      return deletedUser;
    } catch (err) {
      throw new APIError(
        "internal server error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  //update user assignment
  async updateUserAssignment({ sellerId, shopId, fromDate, toDate, type }) {
    try {
      // Ensure sellerId is passed and not undefined or null
      if (!sellerId) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "SELLER ID NO FOUND"
        );
      }

      // Build the assignment history object
      const assignmentHistory = {
        shopId: shopId.toString(),
        fromDate: fromDate || null,
        toDate: toDate || null,
        type: type || "unknown",
      };

      // Push the assignment history to the user document
      const updatedUser = await User.findByIdAndUpdate(
        sellerId,
        {
          $push: { assignmentHistory },
          $set: { assignedShop: shopId },
        },
        { new: true }
      );

      return updatedUser;
    } catch (err) {
      console.error("Error updating user assignment:", err);
      throw err;
    }
  }

  async SearchUsers(userItem) {
    try {
      const regexPattern = new RegExp(`^${userItem}`, "i");
      const foundUser = await User.aggregate([
        {
          $match: {
            $or: [
              { "name": { $regex: regexPattern } },
              { "email": { $regex: regexPattern } }
            ]
          }
        },

        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
          }
        }
      ])
      return foundUser;
    }
    catch (err) {
      throw new APIError("database error", STATUS_CODE.INTERNAL_ERROR, "internal server error")
    }
  }
}

export { usermanagemenRepository };
