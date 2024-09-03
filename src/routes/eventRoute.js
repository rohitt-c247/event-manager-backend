import express from "express";
import eventController from "../controllers/eventController.js";
// import { verifyToken } from "../middleware/userVerification.js";

const router = express.Router();

router.post('/', eventController.createEvent);

export default router