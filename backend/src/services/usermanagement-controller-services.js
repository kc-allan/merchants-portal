import { usermanagemenRepository } from "../databases/repository/usermanagement-controller-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";
import {
  GenerateSalt,
  Generatepassword,
  GenerateSignature,
  validatePassword,
} from "../Utils/bcryptservicesgeneratetoken.js";
class userManagmentService {
  constructor() {
    this.repository = new usermanagemenRepository();
  }
  async findAllUser(page, limit) {
    try {
      const { users, totalPages } = await this.repository.fetchAllUsers(
        page,
        limit
      );
      if (users.length === 0) {
        throw new APIError(
          "users not found",
          STATUS_CODE.NOT_FOUND,
          "users are currently not available"
        );
      }

      const verfiedUser = users.filter((user) => user !== null);
      return { allUsers: verfiedUser, totalPages };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "An error occurred during the login process"
      );
    }
  }

  //get specic user for profile display

  async findSpecificUser(useremail) {
    try {
      const userAvailable = await this.repository.findUser({ email: useremail });
      // console.log("**************************", userAvailable)
      return userAvailable;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "An error occurred during the login process"
      );
    }
  }

  async UserLogin(userlogindetails) {
    try {
      const { email, password } = userlogindetails;
      const userAvailable = await this.repository.findUser({ email: email });
      if (!userAvailable) {
        throw new APIError("Not found", 404, "The user is not found");
      }

      const passwordMatch = await validatePassword(
        password,
        userAvailable.password
      );

      console.log("password match", passwordMatch);

      if (!passwordMatch) {
        throw new APIError(
          "Authentication Error",
          STATUS_CODE.UNAUTHORIZED,
          "Invalid password"
        );
      }

      const payload = {
        id: userAvailable._id,
        role: userAvailable.role,
        email: userAvailable.email,
        name: userAvailable.name,
        phonenumber: userAvailable.phonenumber,
        workingstatus: userAvailable.workingstatus,
      };
      const token = await GenerateSignature(payload);
      return { token, userAvailable };
    } catch (err) {
      console.log("service error", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "An error occurred during the login process"
      );
    }
  }

  async createSuperUser(superuserdetails) {
    try {
      const {
        name,
        email,
        password,
        phonenumber,
        nextofkinname,
        nextofkinphonenumber,
      } = superuserdetails;
      const salt = await GenerateSalt();
      const hashedpassword = await Generatepassword(salt, password);
      const newUser = await this.repository.createMainAdmin({
        name,
        email,
        hashedpassword,
        phonenumber,
        nextofkinname,
        nextofkinphonenumber,
      });
      return newUser;
    } catch (err) {
      throw err;
    }
  }
  async createSeller(sellerdetails) {
    try {
      const {
        name,
        email,
        password,
        phonenumber,
        nextofkinname,
        nextofkinphonenumber,
      } = sellerdetails;
      const salt = await GenerateSalt();
      const hashedpassword = await Generatepassword(salt, password);
      const newUser = await this.repository.createSeller({
        name,
        email,
        hashedpassword,
        phonenumber,
        nextofkinname,
        nextofkinphonenumber,
      });
      return newUser;
    } catch (err) {
      console.log("sevice", err)
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "An error occurred during the signup process"
      );
    }
  }

  async addprofilepicture(userdetails) {
    try {
      const { email, imgUrls } = userdetails;
      const findUser = await this.findSpecificUser(email);
      let id = findUser.id;
      if (
        !findUser ||
        findUser.workingstatus === "suspended" ||
        findUser.workingstatus === "inactive"
      ) {
        throw new APIError(
          "unathorised",
          STATUS_CODE.UNAUTHORIZED,
          "not allowed to update profile picture"
        );
      }

      const updatedUser = await this.repository.addprofilepicture({
        imgUrls,
        id,
      });
      return updatedUser;
    } catch (err) {
      console.log("service", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "service error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async addIDpicture(userdetails) {
    try {
      const { email, imgUrls } = userdetails;
      const findUser = await this.findSpecificUser(email);
      let id = findUser.id;
      if (
        !findUser ||
        findUser.workingstatus === "suspended" ||
        findUser.workingstatus === "inactive"
      ) {
        throw new APIError(
          "unathorised",
          STATUS_CODE.UNAUTHORIZED,
          "not allowed to update profile picture"
        );
      }

      const updatedUser = await this.repository.addIDpicture({ imgUrls, id });
      return updatedUser;
    } catch (err) {
      console.log("service", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "service error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async addIDpicturebackward(userdetails) {
    try {
      const { email, imgUrls } = userdetails;
      const findUser = await this.findSpecificUser(email);
      let id = findUser.id;
      if (
        !findUser ||
        findUser.workingstatus === "suspended" ||
        findUser.workingstatus === "inactive"
      ) {
        throw new APIError(
          "unathorised",
          STATUS_CODE.UNAUTHORIZED,
          "not allowed to update profile picture"
        );
      }

      const updatedUser = await this.repository.addIDpicturebackward({
        imgUrls,
        id,
      });
      return updatedUser;
    } catch (err) {
      console.log("service", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "service error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async updateUserStatus(userdetails) {
    try {
      const { status, id } = userdetails;

      const updatedUser = await this.repository.updateUser({ status, id });

      return updatedUser;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }

      throw new APIError(
        "service error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async updateUserRole(userdetails) {
    try {
      const { role, id } = userdetails;
      const updatedUser = await this.repository.updateUserRole({ role, id });
      return updatedUser;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }

      throw new APIError(
        "service error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async updateUserProfile(userdetails) {
    try {
      const { password, phone, name, email, userRequestedId, nextofkinname, nextofkinphonenumber } = userdetails;

      let updatedFields = { name, phone, email, nextofkinname, nextofkinphonenumber };

      if (password) {
        const salt = await GenerateSalt();
        const hashedPassword = await Generatepassword(salt, password);
        updatedFields.password = hashedPassword;
      }

      const updatedUser = await this.repository.updateUserProfile({
        ...updatedFields,
        id: userRequestedId,
      });

      return updatedUser;
    } catch (err) {
      console.log("err", err);
      if (err instanceof APIError) {
        throw err;
      }

      throw new APIError(
        "Service error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async findUserBySearch(userItem) {
    try {
      const user = await this.repository.SearchUsers(userItem);
      if (!user.length) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "user not found"
        )
      }
      return user;
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
export { userManagmentService };
