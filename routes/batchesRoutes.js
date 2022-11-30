import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  getAllBatches,
  createBatch,
  getBatchById,
  activateBatch,
} from '../controllers/batchesController.js';
const router = express.Router();

router.get('/', protect, admin, getAllBatches);
router.post('/', protect, admin, createBatch);
router.get('/:id', protect, admin, getBatchById);
router.put('/:id/activate', protect, admin, activateBatch);
// router.put('/:id', protect, admin, updateBatch);
// router.delete('/:id', protect, admin, deleteBatch);

export default router;
