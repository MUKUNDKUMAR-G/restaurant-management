import { Router } from 'express';
const router = Router();
import verifyToken from "../middlewares/verify-token.js";

import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import { getBillDetail } from '../controllers/bill.controller.js';


router.get('/:billId',verifyToken , asyncErrorHandler(getBillDetail));

export default router;