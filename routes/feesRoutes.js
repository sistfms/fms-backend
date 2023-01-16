import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  addFees,
  getFeeReport
} from '../controllers/feesController.js';
const router = express.Router();

router.post("/", protect, admin, addFees);
router.get("/:id", getFeeReport);

export default router;
