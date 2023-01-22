import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  addFees,
  getFeeDetails,
  getFeeReport,
  getStudentFeeReport
} from '../controllers/feesController.js';
const router = express.Router();

router.post("/", protect, admin, addFees);
router.get("/student/:id",  getStudentFeeReport);
router.get("/:id/report", protect, admin, getFeeReport);
router.get("/:id", protect, admin, getFeeDetails)

export default router;
