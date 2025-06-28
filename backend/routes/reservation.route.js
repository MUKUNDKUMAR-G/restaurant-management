import { Router } from "express";
const router = Router();

import { 
    submitReservation,
    deleteReservation,
    submitReview,
    updateReservation,
    searchReservationSlipsController,
    searchReservationSlipsByBranchController
} from '../controllers/reservation.controller.js';

import verifyToken from "../middlewares/verify-token.js";

import asyncErrorHandler from "../utils/asyncErrorHandler.js";

router.post('/:branchId', verifyToken, asyncErrorHandler(submitReservation));
router.delete('/:reservationSlipId', verifyToken, asyncErrorHandler(deleteReservation));
router.post('/:reservationSlipId/review', verifyToken, asyncErrorHandler(submitReview));
router.patch('/:reservationSlipId', verifyToken, asyncErrorHandler(updateReservation));

// Add Search Reservation Slips by User endpoint with middleware
router.get('/search', verifyToken, asyncErrorHandler(searchReservationSlipsController));

// Add Search Reservation Slips by Branch endpoint with middleware
router.get('/branch/:branchId', verifyToken, asyncErrorHandler(searchReservationSlipsByBranchController));

export default router;