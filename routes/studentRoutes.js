import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  addStudent,
  getAllStudents,
  getStudentById
} from '../controllers/studentController.js';
const router = express.Router();

router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.post("/", addStudent);
// router.put("/:id", protect, admin, updateStudent);
// router.delete("/:id", protect, admin, deleteStudent);

export default router;
