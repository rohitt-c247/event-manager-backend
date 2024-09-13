import express from "express";
import { postGroup,getGroup } from "../controllers/groupController";

const router = express.Router();

router.post('/', postGroup);
router.get('/', getGroup);


export default router