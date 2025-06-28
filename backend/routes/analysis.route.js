import { Router } from 'express';

import verifyToken from "../middlewares/verify-token.js";

import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import { getAnalysisController, getModernAnalytics } from "../controllers/analysis.controller.js";

// Append the GET route
const router = Router();

router.get('/', verifyToken, asyncErrorHandler(getAnalysisController));
router.get('/modern', verifyToken, asyncErrorHandler(getModernAnalytics));

export default router;
