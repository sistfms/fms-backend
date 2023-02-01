import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  getAllPaymentsByOrderId,
  getFeePaymentDetails, getOrderId,
  updateStatusHook,
  cashEntry
} from '../controllers/paymentDetailController.js';
const router = express.Router();

router.post("/getFeePaymentDetails", protect, getFeePaymentDetails)
router.post("/getOrderId", protect, getOrderId)
router.use("/updateStatusHook", updateStatusHook)
router.post("/getPaymentHistory", protect, getAllPaymentsByOrderId)
router.post("/cashEntry", protect, admin, cashEntry);

export default router;
