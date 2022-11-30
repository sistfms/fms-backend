import express from "express";
import { verifyRefreshToken } from "../middlewares/verifyToken.js";
import {
  loginController,
  logoutController,
  refreshController,
} from "../controllers/authController.js";
const router = express.Router();

router.post("/login", loginController);

router.get("/logout", logoutController);
router.get("/refresh", refreshController);

export default router;
