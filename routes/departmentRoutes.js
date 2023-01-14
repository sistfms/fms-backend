import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  getAllDepartments,
  createDepartment,
  getDepartmentById,
} from '../controllers/departmentController.js';

const router = express.Router();

router.get('/', protect, admin, getAllDepartments);
router.post('/', protect, admin, createDepartment);
router.get('/:id', protect, admin, getDepartmentById);

export default router;
