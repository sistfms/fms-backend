import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  addFees,
  getFeeDetails,
  getFeeReport
} from '../controllers/feesController.js';
const router = express.Router();

router.post("/", protect, admin, addFees);
router.get("/:id", protect, admin, getFeeDetails)
router.get("/:id/report", protect, admin, getFeeReport);

export default router;
