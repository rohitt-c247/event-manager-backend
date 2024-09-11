import express from "express";
import { memberController } from "../controllers/index.js";
import memberValidator from "../validators/memberValidator.js";
import handleValidationErrors from "../middlewares/handleValidation.js";
import { memberCreateValidationSchema, memberUpdateValidationSchema } from "../validators/member-validator.js";
import { joiValidate } from "../middlewares/joiValidate.js";
// import { verifyToken } from "../middleware/userVerification.js";

const router = express.Router();

router.post('/verify-login', memberController.verifyMemberLogin);
router.post('/', joiValidate(memberCreateValidationSchema), memberController.addTeamMembers);
router.get('/', memberController.getMembers);
router.get('/:id', memberController.getMemberById);
router.put('/:id', joiValidate(memberUpdateValidationSchema), handleValidationErrors, memberController.updateMember);
router.delete('/:id', memberController.deleteMember);
router.get('/auth/team', memberController.getAuthTeamMembers);


export default router