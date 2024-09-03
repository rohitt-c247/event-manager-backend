import express from "express";
import memberRoute from "./memberRoute.js";
import departmentRoute from "./departmentRoute.js";

const router = express.Router();

router.use("/member", memberRoute);
router.use("/department", departmentRoute);

export default router;