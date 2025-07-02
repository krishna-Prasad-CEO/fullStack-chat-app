import { Router } from "express";
import {
  signUp,
  logIn,
  logOut,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signUp", signUp);
router.post("/logIn", logIn);
router.post("/logOut", protectedRoute, logOut);
router.put("/updateProfile", protectedRoute, updateProfile);
router.get("/checkAuth", protectedRoute, checkAuth);

export default router;
