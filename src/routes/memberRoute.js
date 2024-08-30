import express from "express";
import { memberController } from "../controllers/index.js";
// import { verifyToken } from "../middleware/userVerification.js";

const router = express.Router();

router.post('/verify-login', memberController.verifyMemberLogin);
router.post('/', memberController.addTeamMembers);


export default router