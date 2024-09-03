import express from "express";
import departmentController from "../controllers/departmentController.js";
// import { verifyToken } from "../middleware/userVerification.js";

const router = express.Router();

router.post('/', departmentController.addDepartment);
router.get('/', departmentController.getDepartment);



export default router