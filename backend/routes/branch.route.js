import { Router } from "express";

import verifyToken from "../middlewares/verify-token.js";
import verifyAdmin from "../middlewares/verify-admin.js";

import asyncErrorHandler from "../utils/asyncErrorHandler.js";

import {
    createBranch,
    updateBranch,
    getBranch,
    getContract,
    searchBranchesController
} from "../controllers/branch.controller.js";

const router = Router();

// Public routes (no authentication required)
router.get("/", asyncErrorHandler(getBranch));
router.get("/search", asyncErrorHandler(searchBranchesController));

// Protected routes (authentication required)
router.post("/", verifyToken, asyncErrorHandler(createBranch));
router.patch("/:branchId", verifyToken, asyncErrorHandler(updateBranch));
router.get('/:branchId', verifyToken, asyncErrorHandler(getContract));

export default router;
