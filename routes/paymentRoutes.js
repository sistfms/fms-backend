import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  getFeePaymentDetails, getOrderId,
  updateStatusHook
} from '../controllers/paymentDetailController.js';
const router = express.Router();

router.post("/getFeePaymentDetails", getFeePaymentDetails)
router.post("/getOrderId", getOrderId)
router.use("/updateStatusHook", updateStatusHook)

export default router;
