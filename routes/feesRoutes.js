import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  addFees
} from '../controllers/feesController.js';
const router = express.Router();

router.post("/", protect, admin, addFees);

export default router;
