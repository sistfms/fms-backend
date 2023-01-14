import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  getAllBatches,
  createBatch,
  getBatchById,
  activateBatch,
  getStudentsByBatchId,
  getFeesByBatchId
} from '../controllers/batchesController.js';
const router = express.Router();

router.get('/',  getAllBatches);
router.post('/',  createBatch);
router.get('/:id',  getBatchById);
router.put('/:id/activate',  activateBatch);
// router.put('/:id', protect, admin, updateBatch);
// router.delete('/:id', protect, admin, deleteBatch);

// student batch integrations
router.get('/:id/students', protect, admin, getStudentsByBatchId);

// Batch and Fees Integrations
router.get('/:id/fees', protect, admin, getFeesByBatchId);

export default router;
