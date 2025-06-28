import express from "express";
const router = express.Router();
import { GetRegions } from "../controllers/region.controller.js"; // Corrected import
import verifyToken from "../middlewares/verify-token.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

// Định nghĩa route GET /regions
router.get("/", verifyToken, asyncErrorHandler(GetRegions));

export default router;
