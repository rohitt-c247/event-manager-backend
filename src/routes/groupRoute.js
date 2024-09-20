import express from "express";
import { postGroup, getGroup, shiftGroupMember, updateGroup } from "../controllers/groupController.js";
import { groupUpdateValidationSchema } from "../validators/group-validator.js";
import { joiValidate } from "../middlewares/joiValidate.js";

const router = express.Router();

// router.post('/', postGroup);
router.get('/', getGroup);
router.patch('/', shiftGroupMember);
router.put('/', joiValidate(groupUpdateValidationSchema), updateGroup);

export default router