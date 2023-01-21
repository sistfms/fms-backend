import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  addStudent,
  getAllStudents,
  getStudentById,
  getStudentByToken,
  activateStudent
} from '../controllers/studentController.js';
const router = express.Router();

router.get("/", getAllStudents);
router.get("/getStudentByToken", getStudentByToken);
router.post("/activateStudent", activateStudent)
router.get("/:id", getStudentById);
router.post("/", addStudent);
// router.put("/:id", protect, admin, updateStudent);
// router.delete("/:id", protect, admin, deleteStudent);

export default router;
