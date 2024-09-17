import express from "express";
import memberRoute from "./memberRoute.js";
import departmentRoute from "./departmentRoute.js";
import eventRoute from "./eventRoute.js";
import positionRoute from "./positionRoute.js";
import groupsRoute from "./groupRoute.js";

const router = express.Router();

router.use("/api/member", memberRoute);
router.use("/api/department", departmentRoute);
router.use("/api/event", eventRoute);
router.use("/api/position", positionRoute);
// router.use('/group', groupsRoute)

export default router;