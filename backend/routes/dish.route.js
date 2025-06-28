import { Router } from "express";
const router = Router();

import { 
    submitReview,
    addDishtoMenu,
    submitDish,
    GetCategories,
    removeDishFromMenuController,
    updateDish,
    searchDishesController,
    getDishDetail,
} from '../controllers/dish.controller.js';

import verifyToken from "../middlewares/verify-token.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

// Public routes (no authentication required)
router.get("/", asyncErrorHandler(GetCategories));
router.get("/search", asyncErrorHandler(searchDishesController));
router.get('/:dishId', asyncErrorHandler(getDishDetail));

// Protected routes (authentication required)
router.post('/:dishId/review', verifyToken, asyncErrorHandler(submitReview));
router.post('/', verifyToken, asyncErrorHandler(submitDish));
router.post('/:dishId/branch/:branchId', verifyToken, asyncErrorHandler(addDishtoMenu));
router.delete('/:dishId/branch/:branchId', verifyToken, asyncErrorHandler(removeDishFromMenuController));
router.patch("/:dishId", verifyToken, asyncErrorHandler(updateDish));

export default router;
