import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import config from "../Config/index.js";
const { APP_SECRET } = config;
const verifyUser = async (req, res, next) => {
    const token = req.cookies.usertoken;
    console.log("token", token)
    if (token) {
        try {
            jwt.verify(token, APP_SECRET, (err, user) => {
                console.log("error", err)
                if (err) return res.status(401).send("Access Denied")
                req.user = user;
                next();
            });
        } catch (error) {
            res.status(500).send("Internal server error");
        }
    } else {
        return res.status(401).json({ message: "not authorised" })
    }
};

export { verifyUser };