import express from "express";
import { postGroup,getGroup } from "../controllers/groupController.js";

const router = express.Router();

// router.post('/', postGroup);
router.get('/', getGroup);


export default router