import express from "express";
import { GetDistricts } from "../controllers/district.controller.js";
const router = express.Router();
router.get("/", GetDistricts);
export default router; 