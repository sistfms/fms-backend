import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  getAllBatches,
  createBatch,
  getBatchById,
  activateBatch,
  getStudentsByBatchId,
  getFeesByBatchId,
  createBatchFee
} from '../controllers/batchesController.js';
const router = express.Router();

router.get('/',  getAllBatches);
router.post('/',  createBatch);
router.get('/:id',  getBatchById);
router.put('/:id/activate',  activateBatch);
// router.put('/:id', protect, admin, updateBatch);
// router.delete('/:id', protect, admin, deleteBatch);

// Batch Fees Integrations
router.get('/:id/fees', getFeesByBatchId);
router.post('/:id/fees',  createBatchFee);

// student batch integrations
router.get('/:id/students', protect, admin, getStudentsByBatchId);

export default router;
