import express from "express";
import { postGroup,getGroup, shiftGroupMember } from "../controllers/groupController.js";

const router = express.Router();

// router.post('/', postGroup);
router.get('/', getGroup);
router.patch('/', shiftGroupMember);



export default router