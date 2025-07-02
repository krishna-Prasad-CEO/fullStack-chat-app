import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import {
  getUsers,
  getUser,
  sendMessage,
  getMessages,
} from "../controllers/message.controller.js";
const router = express.Router();

router.get("/users", protectedRoute, getUsers);
router.get("/users/:id", protectedRoute, getUser);
router.get("/messages/:id", protectedRoute, getMessages);
router.post("/send/:id", protectedRoute, sendMessage);

export default router;
