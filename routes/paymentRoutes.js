import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  getAllPaymentsByOrderId,
  getFeePaymentDetails, getOrderId,
  updateStatusHook
} from '../controllers/paymentDetailController.js';
const router = express.Router();

router.post("/getFeePaymentDetails", getFeePaymentDetails)
router.post("/getOrderId", getOrderId)
router.use("/updateStatusHook", updateStatusHook)
router.post("/getPaymentHistory", getAllPaymentsByOrderId)

export default router;
