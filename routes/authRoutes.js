import express from "express";
import {
  loginController,
  logoutController,
  refreshController,
  registerUserController,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/login", loginController);
router.post("/register", registerUserController);
router.get("/logout", logoutController);
router.get("/refresh", protect , refreshController);

export default router;
