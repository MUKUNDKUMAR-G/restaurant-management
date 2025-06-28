import { Router } from 'express';
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import { searchMenu } from '../controllers/menu.controller.js';

const router = Router();

// Public route for menu access
router.get('/:branchId', asyncErrorHandler(searchMenu));

export default router;