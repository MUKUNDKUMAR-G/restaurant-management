import express from "express";
import { GetWards } from "../controllers/ward.controller.js";
const router = express.Router();
router.get("/", GetWards);
export default router; 