import express from "express";
import memberRoute from "./memberRoute.js";

const router = express.Router();

router.use("/member", memberRoute);

export default router;