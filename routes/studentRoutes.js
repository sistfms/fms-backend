import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  addStudent,
  getAllStudents,
  getStudentById,
  getStudentByToken,
  activateStudent,
  getStudentByUserId,
  searchStudent
} from '../controllers/studentController.js';
const router = express.Router();

router.get("/", getAllStudents);
router.get("/getStudentByToken", getStudentByToken);
router.post("/getStudentByUserId", protect, getStudentByUserId)
router.post("/activateStudent", activateStudent)
router.get("/:id", protect, getStudentById);
router.post("/", protect, admin, addStudent);
router.post("/search", protect, admin, searchStudent)
// router.put("/:id", protect, admin, updateStudent);
// router.delete("/:id", protect, admin, deleteStudent);

export default router;
