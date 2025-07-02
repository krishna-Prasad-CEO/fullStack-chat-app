import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const protectedRoute = async (req, res, next) => {
  try {
    const cookie = req.cookies.jwt;

    if (!cookie) {
      return res
        .status(400)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(cookie, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Protected Route Error:", error);
    res
      .status(400)
      .json({ message: `Problem at Protected Route : ${error.message}` });
  }
};
