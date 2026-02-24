import express from "express";
import departmentController from "../controllers/departmentController.js";
import { departmentCreateValidationSchema } from "../validators/department-validator.js";
import { joiValidate } from "../middlewares/joiValidate.js";

const router = express.Router();

router.post('/', joiValidate(departmentCreateValidationSchema), departmentController.addDepartment);
router.get('/', departmentController.getDepartment);



export default router