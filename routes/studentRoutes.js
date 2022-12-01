import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  addStudent,
  getAllStudents,
  getStudentById
} from '../controllers/studentController.js';
const router = express.Router();

router.get("/", protect, admin, getAllStudents);
router.get("/:id", protect, admin, getStudentById);
router.post("/", protect, admin, addStudent);
// router.put("/:id", protect, admin, updateStudent);
// router.delete("/:id", protect, admin, deleteStudent);

export default router;
