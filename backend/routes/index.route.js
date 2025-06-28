import { Router } from "express";
const router = Router();

import authRoute from "./auth.route.js";
import orderRoute from "./order.route.js";
import reservationRoute from "./reservation.route.js";
import dishRoute from "./dish.route.js";
import employeeRoute from "./employee.route.js";
import departmentRoute from "./department.route.js";
import userRoute from "./user.route.js";
import branchRoute from "./branch.route.js";
import cardRoute from "./card.route.js";
import menuRoute from "./menu.route.js";
import regionRoute from "./region.route.js";
import billRoute from './bill.route.js';
import analaysisRoute from './analysis.route.js';
import districtRoute from "./district.route.js";
import wardRoute from "./ward.route.js";

router.use("/auth", authRoute);
router.use("/order", orderRoute);
router.use("/reservation", reservationRoute);
router.use("/dish", dishRoute);
router.use("/employee", employeeRoute);
router.use("/department", departmentRoute);
router.use("/user", userRoute);
router.use("/branch", branchRoute);
router.use("/card", cardRoute);
router.use("/menu", menuRoute);
router.use("/bill", billRoute);
router.use("/region", regionRoute);
router.use('/analysis', analaysisRoute);
router.use("/district", districtRoute);
router.use("/ward", wardRoute);

export default router;
