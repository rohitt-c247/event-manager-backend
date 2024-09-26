import express from "express";
import { postGroup, getGroup, shiftGroupMember, updateGroup, deleteGroup } from "../controllers/groupController.js";
import { groupUpdateValidationSchema } from "../validators/group-validator.js";
import { joiValidate } from "../middlewares/joiValidate.js";

const router = express.Router();

router.post('/', postGroup);
router.get('/', getGroup);
router.patch('/', shiftGroupMember);
router.put('/', joiValidate(groupUpdateValidationSchema), updateGroup);
router.delete('/:id', deleteGroup);

export default router