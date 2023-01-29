import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  getFeePaymentDetails, getOrderId
} from '../controllers/paymentDetailController.js';
const router = express.Router();

router.post("/getFeePaymentDetails", getFeePaymentDetails)
router.post("/getOrderId", getOrderId)

export default router;
