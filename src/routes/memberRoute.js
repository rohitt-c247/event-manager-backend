import express from "express";
import { memberController } from "../controllers/index.js";
// import { verifyToken } from "../middleware/userVerification.js";

const router = express.Router();

router.post('/verify-login', memberController.verifyMemberLogin);
router.post('/', memberController.addTeamMembers);
router.get('/', memberController.getMembers);
router.get('/:id', memberController.getMemberById);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);


export default router