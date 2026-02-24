import express from "express";
import { authController } from "../controllers/index.js";
import handleValidationErrors from "../middlewares/handleValidation.js";
import { userCreateValidationSchema, userLoginValidationSchema } from "../validators/auth-validator.js";
import { joiValidate } from "../middlewares/joiValidate.js";

const router = express.Router();

router.post(
  "/",
  joiValidate(userCreateValidationSchema),
  handleValidationErrors,
  authController.registerUser,
);

router.post(
  "/login",
  joiValidate(userLoginValidationSchema),
  handleValidationErrors,
  authController.loginUser,
);

export default router;
