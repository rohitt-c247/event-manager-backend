import express from "express";
import { memberController } from "../controllers/index.js";
import handleValidationErrors from "../middlewares/handleValidation.js";
import { memberCreateValidationSchema, memberUpdateValidationSchema } from "../validators/member-validator.js";
import { joiParamValidate, joiValidate } from "../middlewares/joiValidate.js";
import { paramsValidationSchema } from "../validators/base-validator.js";
// import { verifyToken } from "../middleware/userVerification.js";

const router = express.Router();

router.post('/verify-login', memberController.verifyMemberLogin);
router.post('/', joiValidate(memberCreateValidationSchema), memberController.addTeamMembers);
router.get('/', memberController.getMembers);
router.get('/:id', joiParamValidate(paramsValidationSchema), memberController.getMemberById);
router.put('/:id', joiValidate(memberUpdateValidationSchema), handleValidationErrors, memberController.updateMember);
router.delete('/:id', joiParamValidate(paramsValidationSchema), memberController.deleteMember);
router.get('/auth/team', memberController.getAuthTeamMembers);


export default router