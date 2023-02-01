import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import { getStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/", protect, admin, getStats)

export default router;
