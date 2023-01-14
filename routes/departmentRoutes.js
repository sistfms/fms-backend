import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  getAllDepartments,
  createDepartment,
  getDepartmentById,
} from '../controllers/departmentController.js';

const router = express.Router();

router.get('/', getAllDepartments);
router.post('/', createDepartment);
router.get('/:id', getDepartmentById);

export default router;
