import { Router } from "express";
const router = Router();

import { 
    test, 
    registerUser,
    loginUser,
    logoutUser,
    requestRefreshToken
} from '../controllers/auth.controller.js';

import verifyToken from "../middlewares/verify-token.js";

import asyncErrorHandler from "../utils/asyncErrorHandler.js";

router.get('/test', verifyToken, asyncErrorHandler(test));
router.post('/register', asyncErrorHandler(registerUser));
router.post('/login', asyncErrorHandler(loginUser));
router.post('/logout', asyncErrorHandler(logoutUser));
router.post('/refresh', asyncErrorHandler(requestRefreshToken));

export default router;