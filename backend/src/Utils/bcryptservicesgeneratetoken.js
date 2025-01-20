import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Config from "../Config/index.js";
const { APP_SECRET } = Config;
const GenerateSalt = async () => {
  return bcrypt.genSalt();
};

const Generatepassword = async (salt, password) => {
  const hashedpassword = await bcrypt.hash(password, salt);
  return hashedpassword;
};

const validatePassword = async (submittedpassword, userpassword) => {
  return await bcrypt.compare(submittedpassword, userpassword);
};

const GenerateSignature = async (payload) => {
  const generatedToken = await jwt.sign(payload, APP_SECRET);
  return generatedToken;
};
export { GenerateSalt, Generatepassword, validatePassword, GenerateSignature };
