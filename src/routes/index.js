import express from "express";
import memberRoute from "./memberRoute.js";
import departmentRoute from "./departmentRoute.js";
import eventRoute from "./eventRoute.js";
import positionRoute from "./positionRoute.js";
import groupsRoute from "./groupRoute.js";

const router = express.Router();

router.use("/member", memberRoute);
router.use("/department", departmentRoute);
router.use("/event", eventRoute);
router.use("/position", positionRoute);
// router.use('/group', groupsRoute)

export default router;